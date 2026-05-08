import { NextRequest } from "next/server";
import { runMutation } from "../../../lib/services/mutation.service";
import { successResponse, handleApiError, handleOptions, corsHeaders } from "../../../lib/utils/errors";
import { logger } from "../../../lib/utils/logger";

/**
 * POST /api/mutate
 *
 * Updates an existing simulation based on a new condition.
 *
 * Request body:
 * {
 *   "simulation_id": "uuid",
 *   "existing_state": {},           // Full simulation JSON (optional if sim is in DB)
 *   "mutation_prompt": "Government subsidizes online certifications"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { simulation_id, existing_state, mutation_prompt } = body;

    if (!simulation_id || typeof simulation_id !== "string") {
      return successResponse({ error: "simulation_id is required" }, 400);
    }
    if (!mutation_prompt || typeof mutation_prompt !== "string") {
      return successResponse({ error: "mutation_prompt is required" }, 400);
    }

    logger.info("[POST /api/mutate] Request received", {
      simulation_id,
      mutation_prompt: mutation_prompt.slice(0, 100),
    });

    const mutation = await runMutation({ simulation_id, existing_state: existing_state ?? {}, mutation_prompt });

    const response = successResponse(mutation);
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
