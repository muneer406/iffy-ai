import { z } from "zod";

/**
 * A single node in the simulation graph.
 * Represents a system, institution, industry, or concept.
 */
export const NodeSchema = z.object({
  id: z.string().min(1, "Node id required"),
  label: z.string().min(1, "Node label required"),
  description: z.string().min(1),
  impact_score: z.number().min(-100).max(100),
  impact_direction: z.enum(["positive", "negative", "neutral"]),
  confidence: z.number().min(0).max(1),
  duration: z.object({
    immediate: z.number().min(-100).max(100),
    short_term: z.number().min(-100).max(100),
    long_term: z.number().min(-100).max(100),
  }),
  tags: z.array(z.string()).min(1),
});

export type Node = z.infer<typeof NodeSchema>;
