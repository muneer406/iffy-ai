import { NextRequest } from "next/server";
import { runSectorAnalysis } from "../../../lib/services/sector.service";
import { successResponse, handleApiError, handleOptions, corsHeaders } from "../../../lib/utils/errors";
import { logger } from "../../../lib/utils/logger";

/**
 * POST /api/sector
 *
 * Generates a deep-dive analysis for a specific sector within a simulation.
 *
 * Request body:
 * {
 *   "simulation_id": "uuid",
 *   "sector": "Education"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { simulation_id, sector } = body;

    if (!simulation_id || typeof simulation_id !== "string") {
      return successResponse({ error: "simulation_id is required" }, 400);
    }
    if (!sector || typeof sector !== "string") {
      return successResponse({ error: "sector is required" }, 400);
    }

    logger.info("[POST /api/sector] Request received", { simulation_id, sector });

    const analysis = await runSectorAnalysis({ simulation_id, sector });

    const response = successResponse(analysis);
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
