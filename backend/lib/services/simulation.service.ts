import { v4 as uuidv4 } from "uuid";
import { generateFromAI } from "../ai/pipeline/generate";
import { validateOutput } from "../ai/pipeline/validate";
import { repairOutput } from "../ai/pipeline/repair";
import { SIMULATE_SYSTEM_PROMPT, buildSimulateUserPrompt } from "../ai/prompts/simulate.prompt";
import { SimulationResponseSchema, SimulationResponse } from "../schemas/simulation.schema";
import { getSupabaseAdmin } from "../supabase/client";
import { simulationCache } from "../utils/cache";
import { logger } from "../utils/logger";
import { GROQ_MODEL } from "../ai/groq";
import { AppError } from "../utils/errors";

export interface SimulateRequest {
  scenario: string;
  user_context?: Record<string, unknown>;
  duration_focus?: "all" | "immediate" | "short_term" | "long_term";
}

/**
 * Simulation Service
 *
 * Orchestrates the full generate → validate → repair → persist pipeline
 * for POST /api/simulate.
 */
export async function runSimulation(req: SimulateRequest): Promise<SimulationResponse> {
  const { scenario, duration_focus = "all" } = req;

  if (!scenario || scenario.trim().length < 5) {
    throw new AppError("bad_request", "Scenario must be at least 5 characters.", 400);
  }

  // ─── Cache Check ────────────────────────────────────────────────────────
  const cacheKey = simulationCache.key(`${scenario}::${duration_focus}`);
  const cached = simulationCache.get(cacheKey);
  if (cached) {
    logger.info("[SimulationService] Cache hit", { scenario });
    return cached as SimulationResponse;
  }

  // ─── Build Prompts ───────────────────────────────────────────────────────
  const systemPrompt = SIMULATE_SYSTEM_PROMPT;
  const userPrompt = buildSimulateUserPrompt(scenario, duration_focus);
  const simulation_id = uuidv4();

  // ─── Generate ────────────────────────────────────────────────────────────
  const rawData = await generateFromAI({
    systemPrompt,
    userPrompt,
    endpoint: "simulate",
  });

  // Inject required top-level fields before validation
  const dataWithMeta = {
    ...(rawData as object),
    simulation_id,
    metadata: {
      scenario,
      duration_focus,
      generated_at: new Date().toISOString(),
      model: GROQ_MODEL,
    },
  };

  // ─── Validate → Repair if needed ─────────────────────────────────────────
  let simulation: SimulationResponse;
  try {
    simulation = validateOutput(SimulationResponseSchema, dataWithMeta, "simulate", 1);
  } catch (err) {
    if (err instanceof AppError && err.type === "validation_error") {
      simulation = await repairOutput({
        schema: SimulationResponseSchema,
        systemPrompt,
        userPrompt,
        endpoint: "simulate",
        badData: dataWithMeta,
        issues: (err.details as string[]) ?? [],
      });
      // Re-inject metadata after repair
      simulation.simulation_id = simulation_id;
      simulation.metadata = {
        scenario,
        duration_focus,
        generated_at: new Date().toISOString(),
        model: GROQ_MODEL,
      };
    } else {
      throw err;
    }
  }

  // ─── Persist to Supabase ─────────────────────────────────────────────────
  try {
    const supabase = getSupabaseAdmin();
    await supabase.from("simulations").insert({
      id: simulation_id,
      title: simulation.title,
      scenario,
      simulation_json: simulation,
    });
  } catch (dbErr) {
    // Non-fatal: log but don't fail the request
    logger.warn("[SimulationService] Failed to persist simulation to Supabase", {
      error: String(dbErr),
      simulation_id,
    });
  }

  // ─── Cache Result ────────────────────────────────────────────────────────
  simulationCache.set(cacheKey, simulation);

  return simulation;
}

/**
 * Retrieves a previously saved simulation by ID.
 */
export async function getSimulationById(id: string): Promise<SimulationResponse | null> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("simulations")
    .select("simulation_json")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data.simulation_json as SimulationResponse;
}
