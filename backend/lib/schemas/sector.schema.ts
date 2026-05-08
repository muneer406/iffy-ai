import { z } from "zod";

/** A single quantified metric for a sector. */
export const MetricSchema = z.object({
  name: z.string().min(1),
  direction: z.enum(["increase", "decrease", "stable"]),
  magnitude: z.number().min(0).max(100),
  confidence: z.number().min(0).max(1),
});

/** Full analysis of a single sector affected by the scenario. */
export const SectorImpactSchema = z.object({
  sector: z.string().min(1),
  overview: z.string().min(1),
  positive_effects: z.array(z.string()).min(1),
  negative_effects: z.array(z.string()).min(1),
  metrics: z.array(MetricSchema).min(1),
  ripple_effects: z.array(z.string()).min(1),
  confidence_score: z.number().min(0).max(1),
});

export type Metric = z.infer<typeof MetricSchema>;
export type SectorImpact = z.infer<typeof SectorImpactSchema>;
