import { NextRequest } from "next/server";
import { runSimulation } from "../../../lib/services/simulation.service";
import { successResponse, handleApiError, handleOptions, corsHeaders } from "../../../lib/utils/errors";
import { logger } from "../../../lib/utils/logger";

/**
 * POST /api/simulate
 *
 * Generates a full new scenario simulation.
 *
 * Request body:
 * {
 *   "scenario": "What if college degrees stopped mattering?",
 *   "user_context": {},              // optional
 *   "duration_focus": "all"          // optional: "all" | "immediate" | "short_term" | "long_term"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenario, user_context, duration_focus } = body;

    if (!scenario || typeof scenario !== "string") {
      return successResponse(null, 400);
    }

    logger.info("[POST /api/simulate] Request received", {
      scenario: scenario.slice(0, 100),
      duration_focus,
    });

    const simulation = await runSimulation({ scenario, user_context, duration_focus });

    const response = successResponse(simulation);
    // Attach CORS headers
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
