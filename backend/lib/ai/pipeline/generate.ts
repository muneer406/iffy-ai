import { getGroqClient, GROQ_MODEL, AI_MAX_RETRIES } from "../groq";
import { logger } from "../../utils/logger";
import { AppError } from "../../utils/errors";

interface GenerateOptions {
  systemPrompt: string;
  userPrompt: string;
  endpoint: string; // for logging
  temperature?: number;
  maxTokens?: number;
}

/**
 * Core LLM call wrapper.
 *
 * - Calls Groq with the given system + user prompt
 * - Instructs the model to output ONLY valid JSON (no markdown, no prose)
 * - Retries up to AI_MAX_RETRIES times on parse or API errors
 * - Returns the raw parsed JSON object (caller must validate against schema)
 */
export async function generateFromAI(options: GenerateOptions): Promise<unknown> {
  const {
    systemPrompt,
    userPrompt,
    endpoint,
    temperature = 0.7,
    maxTokens = 8192,
  } = options;

  const client = getGroqClient();
  let lastError: unknown;

  for (let attempt = 1; attempt <= AI_MAX_RETRIES + 1; attempt++) {
    const start = Date.now();
    try {
      const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const latency = Date.now() - start;
      const raw = completion.choices[0]?.message?.content ?? "";
      const tokens = completion.usage?.total_tokens;

      logger.aiCall({
        endpoint,
        prompt_length: systemPrompt.length + userPrompt.length,
        latency_ms: latency,
        tokens_used: tokens,
        attempt,
        success: true,
      });

      // Parse JSON — let the caller do schema validation
      try {
        return JSON.parse(raw);
      } catch {
        throw new Error(`LLM returned non-JSON content: ${raw.slice(0, 200)}`);
      }
    } catch (err) {
      const latency = Date.now() - start;
      lastError = err;

      logger.aiCall({
        endpoint,
        prompt_length: systemPrompt.length + userPrompt.length,
        latency_ms: latency,
        attempt,
        success: false,
      });

      if (attempt <= AI_MAX_RETRIES) {
        logger.warn(`[AI] Retrying ${endpoint} (attempt ${attempt + 1}/${AI_MAX_RETRIES + 1})`, {
          error: String(err),
        });
        // Small back-off between retries
        await new Promise((r) => setTimeout(r, 500 * attempt));
        continue;
      }
    }
  }

  // All retries exhausted
  throw new AppError(
    "ai_generation_error",
    `AI generation failed after ${AI_MAX_RETRIES + 1} attempts for ${endpoint}`,
    502,
    String(lastError)
  );
}
