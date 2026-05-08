"use client";
import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getBezierPath,
  type EdgeProps,
} from "@xyflow/react";

export const SimulationEdgeComponent = memo(function SimulationEdgeComponent({
  id, sourceX, sourceY, targetX, targetY,
  sourcePosition, targetPosition, data, selected,
}: EdgeProps & { data?: { relationship?: string; strength?: number; explanation?: string } }) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const strength = (data?.strength ?? 0.5);
  const rel = data?.relationship ?? "enable";

  const edgeColor =
    rel === "increase" ? "#10b981"
    : rel === "decrease" ? "#ef4444"
    : rel === "destabilize" ? "#f59e0b"
    : rel === "block" ? "#ef4444"
    : "#3b82f6";

  const strokeWidth = 1 + strength * 2.5;
  const opacity = selected ? 1 : 0.5 + strength * 0.4;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: edgeColor,
          strokeWidth,
          opacity,
          filter: selected ? `drop-shadow(0 0 6px ${edgeColor})` : undefined,
          strokeDasharray: rel === "decrease" || rel === "block" ? "6 3" : undefined,
        }}
        markerEnd={`url(#arrow-${rel})`}
      />

      {selected && data?.explanation && (
        <EdgeLabelRenderer>
          <div
            className="absolute pointer-events-none"
            style={{ transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)` }}
          >
            <div className="px-2 py-1 rounded-md text-[10px] text-slate-300 border border-white/10 bg-[#0f0f1a]/90 backdrop-blur max-w-[160px] text-center leading-snug">
              {data.explanation.slice(0, 80)}{data.explanation.length > 80 ? "…" : ""}
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

SimulationEdgeComponent.displayName = "SimulationEdge";
