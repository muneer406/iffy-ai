import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { SimulationNode, DurationKey } from "@/types/simulation";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Get glow color CSS class based on impact direction */
export function getImpactColor(direction: SimulationNode["impact_direction"]) {
  switch (direction) {
    case "positive": return "text-emerald-400";
    case "negative": return "text-red-400";
    default: return "text-amber-400";
  }
}

/** Get border glow color based on impact direction */
export function getImpactBorderGlow(direction: SimulationNode["impact_direction"]) {
  switch (direction) {
    case "positive": return "shadow-emerald-500/40 border-emerald-500/50";
    case "negative": return "shadow-red-500/40 border-red-500/50";
    default: return "shadow-amber-500/40 border-amber-500/50";
  }
}

/** Get background color for a node */
export function getNodeBg(direction: SimulationNode["impact_direction"]) {
  switch (direction) {
    case "positive": return "#052e16"; // emerald-950
    case "negative": return "#2a0a0a"; // dark red
    default: return "#1c1a00"; // dark amber
  }
}

/** Get impact score for a specific duration */
export function getImpactForDuration(node: SimulationNode, duration: DurationKey): number {
  return node.duration?.[duration] ?? node.impact_score;
}

/** Format impact score as +/-% */
export function formatImpact(score: number): string {
  return `${score >= 0 ? "+" : ""}${score}%`;
}

/** Format confidence as percentage */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/** Generate a consistent avatar color from a participant ID */
export function getParticipantColor(id: string): string {
  const colors = [
    "#3b82f6", "#8b5cf6", "#06b6d4", "#10b981",
    "#f59e0b", "#ef4444", "#ec4899", "#6366f1",
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

/** Get stance badge color */
export function getStanceColor(stance: string) {
  switch (stance) {
    case "supportive": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
    case "opposed": return "bg-red-500/20 text-red-400 border-red-500/30";
    case "conflicted": return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    default: return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
}

/** Capitalize first letter */
export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Truncate text */
export function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}
