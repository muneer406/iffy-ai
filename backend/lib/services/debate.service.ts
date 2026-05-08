import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import { generateFromAI } from "../ai/pipeline/generate";
import { validateOutput } from "../ai/pipeline/validate";
import { repairOutput } from "../ai/pipeline/repair";
import {
  DEBATE_SYSTEM_PROMPT,
  buildDebateUserPrompt,
} from "../ai/prompts/debate.prompt";
import { DebateSchema, DebateMessage, DebateMessageSchema, Participant } from "../schemas/debate.schema";
import { getSupabaseAdmin } from "../supabase/client";
import { logger } from "../utils/logger";
import { AppError } from "../utils/errors";

const ContinuationResponseSchema = z.object({
  messages: z.array(DebateMessageSchema).min(1),
});

export interface DebateRequest {
  simulation_id: string;
  participants: Participant[];
  existing_messages: DebateMessage[];
  continuation_prompt?: string;
  scenario?: string;
}

export interface DebateResponse {
  debate_id: string;
  participants: Participant[];
  messages: DebateMessage[];
}

/**
 * Debate Service
 *
 * Generates initial debate or continues an existing one.
 * Maintains conversational memory by including previous messages in context.
 */
export async function runDebate(req: DebateRequest): Promise<DebateResponse> {
  const {
    simulation_id,
    participants,
    existing_messages,
    continuation_prompt,
    scenario = "this scenario",
  } = req;

  const isNewDebate = existing_messages.length === 0 && participants.length === 0;
  const systemPrompt = DEBATE_SYSTEM_PROMPT;
  const userPrompt = buildDebateUserPrompt(
    scenario,
    participants,
    existing_messages,
    continuation_prompt
  );

  const rawData = await generateFromAI({
    systemPrompt,
    userPrompt,
    endpoint: "debate",
    temperature: 0.85, // Higher temp for personality variety
    maxTokens: 4096,
  });

  let result: DebateResponse;

  if (isNewDebate) {
    // Full debate generation — validate against full DebateSchema
    let debate;
    try {
      debate = validateOutput(DebateSchema, rawData, "debate", 1);
    } catch (err) {
      if (err instanceof AppError && err.type === "validation_error") {
        debate = await repairOutput({
          schema: DebateSchema,
          systemPrompt,
          userPrompt,
          endpoint: "debate",
          badData: rawData,
          issues: (err.details as string[]) ?? [],
        });
      } else {
        throw err;
      }
    }
    result = {
      debate_id: uuidv4(),
      participants: debate.participants,
      messages: debate.messages,
    };
  } else {
    // Continuation — only validate the new messages
    let continuation;
    try {
      continuation = validateOutput(ContinuationResponseSchema, rawData, "debate:continue", 1);
    } catch (err) {
      if (err instanceof AppError && err.type === "validation_error") {
        continuation = await repairOutput({
          schema: ContinuationResponseSchema,
          systemPrompt,
          userPrompt,
          endpoint: "debate:continue",
          badData: rawData,
          issues: (err.details as string[]) ?? [],
        });
      } else {
        throw err;
      }
    }
    result = {
      debate_id: uuidv4(),
      participants,
      messages: [...existing_messages, ...continuation.messages],
    };
  }

  // ─── Persist ─────────────────────────────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("debates").insert({
      id: result.debate_id,
      simulation_id,
      messages: result.messages,
    });
  } catch (dbErr) {
    logger.warn("[DebateService] Failed to persist debate", {
      error: String(dbErr),
      debate_id: result.debate_id,
    });
  }

  return result;
}
