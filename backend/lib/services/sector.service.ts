import { z } from "zod";
import { generateFromAI } from "../ai/pipeline/generate";
import { validateOutput } from "../ai/pipeline/validate";
import { repairOutput } from "../ai/pipeline/repair";
import { SECTOR_SYSTEM_PROMPT, buildSectorUserPrompt } from "../ai/prompts/sector.prompt";
import { SectorImpactSchema } from "../schemas/sector.schema";
import { getSimulationById } from "./simulation.service";
import { AppError } from "../utils/errors";

/** Extended sector schema with sub_sectors and key_players */
const DeepSectorSchema = SectorImpactSchema.extend({
  sub_sectors: z
    .array(
      z.object({
        name: z.string(),
        impact: z.enum(["positive", "negative", "neutral"]),
        explanation: z.string(),
      })
    )
    .optional(),
  key_players: z
    .array(
      z.object({
        type: z.enum(["winners", "losers", "mixed"]),
        group: z.string(),
        reason: z.string(),
      })
    )
    .optional(),
});

export type DeepSectorAnalysis = z.infer<typeof DeepSectorSchema>;

export interface SectorRequest {
  simulation_id: string;
  sector: string;
}

/**
 * Sector Service
 *
 * Generates a deep-dive analysis for a specific sector.
 */
export async function runSectorAnalysis(req: SectorRequest): Promise<DeepSectorAnalysis> {
  const { simulation_id, sector } = req;

  if (!sector || sector.trim().length === 0) {
    throw new AppError("bad_request", "Sector name is required.", 400);
  }

  // Load the simulation for context
  let scenario = sector; // fallback
  let simulationContext: unknown = null;

  try {
    const simulation = await getSimulationById(simulation_id);
    if (simulation) {
      scenario = simulation.metadata?.scenario ?? simulation.title;
      // Provide lightweight context: just node labels + sector overviews
      simulationContext = {
        title: simulation.title,
        summary: simulation.summary,
        systems: simulation.systems,
      };
    }
  } catch {
    // Non-fatal — proceed without context
  }

  const systemPrompt = SECTOR_SYSTEM_PROMPT;
  const userPrompt = buildSectorUserPrompt(scenario, sector, simulationContext);

  const rawData = await generateFromAI({
    systemPrompt,
    userPrompt,
    endpoint: "sector",
    temperature: 0.65,
    maxTokens: 3000,
  });

  let analysis: DeepSectorAnalysis;
  try {
    analysis = validateOutput(DeepSectorSchema, rawData, "sector", 1);
  } catch (err) {
    if (err instanceof AppError && err.type === "validation_error") {
      analysis = await repairOutput({
        schema: DeepSectorSchema,
        systemPrompt,
        userPrompt,
        endpoint: "sector",
        badData: rawData,
        issues: (err.details as string[]) ?? [],
      });
    } else {
      throw err;
    }
  }

  return analysis;
}
