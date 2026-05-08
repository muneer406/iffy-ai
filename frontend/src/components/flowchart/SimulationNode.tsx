"use client";
import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import { motion } from "framer-motion";
import { cn, getImpactColor, formatImpact, getImpactForDuration } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation.store";
import type { SimulationNode, DurationKey } from "@/types/simulation";

export const SimulationNodeComponent = memo(function SimulationNodeComponent({
  data,
  selected,
}: NodeProps & { data: SimulationNode }) {
  const { selectedDuration } = useSimulationStore();
  const score = getImpactForDuration(data, selectedDuration as DurationKey);
  const dir = data.impact_direction;

  const borderColor =
    dir === "positive" ? "rgba(16,185,129,0.5)"
    : dir === "negative" ? "rgba(239,68,68,0.5)"
    : "rgba(245,158,11,0.5)";

  const glowColor =
    dir === "positive" ? "rgba(16,185,129,0.2)"
    : dir === "negative" ? "rgba(239,68,68,0.2)"
    : "rgba(245,158,11,0.2)";

  const bgColor =
    dir === "positive" ? "rgba(5,46,22,0.9)"
    : dir === "negative" ? "rgba(42,10,10,0.9)"
    : "rgba(28,26,0,0.9)";

  const dotColor =
    dir === "positive" ? "#10b981"
    : dir === "negative" ? "#ef4444"
    : "#f59e0b";

  const scale = 0.85 + (Math.abs(score) / 100) * 0.3;

  return (
    <>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <motion.div
        className="relative cursor-pointer"
        style={{ width: 160 * scale, minHeight: 80 }}
        animate={{ scale: selected ? 1.05 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Glow ring */}
        {data.mutated && (
          <div
            className="absolute -inset-1 rounded-xl opacity-60 animate-pulse-glow"
            style={{ background: `radial-gradient(ellipse, ${glowColor} 0%, transparent 70%)`, filter: "blur(8px)" }}
          />
        )}

        {/* Card */}
        <div
          className="relative rounded-xl border px-3 py-2.5 backdrop-blur-md"
          style={{
            background: bgColor,
            borderColor,
            boxShadow: selected
              ? `0 0 0 2px ${borderColor}, 0 0 24px ${glowColor}`
              : `0 0 12px ${glowColor}`,
          }}
        >
          {/* Mutated badge */}
          {data.mutated && (
            <div className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-purple-600 text-white border border-purple-400/50">
              MUTATED
            </div>
          )}

          {/* Status dot */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full animate-pulse-glow" style={{ background: dotColor }} />
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                {data.tags?.[0] ?? "system"}
              </span>
            </div>
            <span className={cn("text-xs font-bold", getImpactColor(dir))}>
              {formatImpact(score)}
            </span>
          </div>

          {/* Label */}
          <div className="text-sm font-semibold text-slate-200 leading-tight mb-1">
            {data.label}
          </div>

          {/* Confidence bar */}
          <div className="h-0.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${data.confidence * 100}%`, background: dotColor }}
            />
          </div>
        </div>
      </motion.div>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </>
  );
});

SimulationNodeComponent.displayName = "SimulationNode";
