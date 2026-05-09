import { z } from "zod";
import { NodeSchema } from "./node.schema";
import { EdgeSchema } from "./edge.schema";
import { TimelineSchema } from "./timeline.schema";
import { SectorImpactSchema } from "./sector.schema";
import { ParticipantSchema } from "./debate.schema";

/**
 * The complete simulation response returned by POST /api/simulate.
 * Enforces all minimum counts defined in the PRD:
 *   - ≥ 6 nodes
 *   - ≥ 5 edges
 *   - ≥ 4 sector_impacts
 *   - ≥ 3 debate_participants
 */
export const SimulationResponseSchema = z.object({
  simulation_id: z.string().uuid(),
  title: z.string().min(1),
  summary: z.string().min(1),
  systems: z.array(z.string()).min(1),
  nodes: z.array(NodeSchema).min(6, "Minimum 6 nodes required"),
  edges: z.array(EdgeSchema).min(5, "Minimum 5 edges required"),
  timeline: TimelineSchema,
  sector_impacts: z.array(SectorImpactSchema).default([]),
  debate_participants: z.array(ParticipantSchema).default([]),
  metadata: z.object({
    scenario: z.string(),
    duration_focus: z.string(),
    generated_at: z.string(),
    model: z.string(),
  }),
});

export type SimulationResponse = z.infer<typeof SimulationResponseSchema>;
