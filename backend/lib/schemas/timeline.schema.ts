import { z } from "zod";

/** A single event within a time horizon. */
export const TimelineEventSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  impact_level: z.number().min(0).max(100),
  affected_systems: z.array(z.string()).min(1),
});

/**
 * The full timeline object.
 * Must always contain all three horizons.
 */
export const TimelineSchema = z.object({
  immediate: z.array(TimelineEventSchema).min(1),
  short_term: z.array(TimelineEventSchema).min(1),
  long_term: z.array(TimelineEventSchema).min(1),
});

export type TimelineEvent = z.infer<typeof TimelineEventSchema>;
export type Timeline = z.infer<typeof TimelineSchema>;
