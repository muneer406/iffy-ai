import { NextRequest } from "next/server";
import { runDebate } from "../../../lib/services/debate.service";
import { successResponse, handleApiError, handleOptions, corsHeaders } from "../../../lib/utils/errors";
import { logger } from "../../../lib/utils/logger";

/**
 * POST /api/debate
 *
 * Generates debate messages. Works for both initial generation
 * (empty participants + messages) and continuation.
 *
 * Request body:
 * {
 *   "simulation_id": "uuid",
 *   "participants": [],             // Empty for new debate; existing participants for continuation
 *   "existing_messages": [],        // Empty for new debate; previous messages for continuation
 *   "continuation_prompt": "",      // Optional focus for continuation (e.g. "What about rural areas?")
 *   "scenario": "What if..."        // The original scenario string for context
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { simulation_id, participants, existing_messages, continuation_prompt, scenario } = body;

    if (!simulation_id || typeof simulation_id !== "string") {
      return successResponse({ error: "simulation_id is required" }, 400);
    }

    logger.info("[POST /api/debate] Request received", {
      simulation_id,
      is_continuation: (existing_messages ?? []).length > 0,
    });

    const debate = await runDebate({
      simulation_id,
      participants: participants ?? [],
      existing_messages: existing_messages ?? [],
      continuation_prompt,
      scenario,
    });

    const response = successResponse(debate);
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  } catch (err) {
    const response = handleApiError(err);
    Object.entries(corsHeaders()).forEach(([k, v]) => response.headers.set(k, v));
    return response;
  }
}

export async function OPTIONS() {
  return handleOptions();
}
