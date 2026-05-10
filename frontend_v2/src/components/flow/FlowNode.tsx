import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface FlowNodeData {
  title: string;
  icon: string;
  state: string;
  impact: number;
  duration: string;
  mutated?: boolean;
}

const stateStyles: Record<string, { ring: string; chip: string; glow: string; label: string }> = {
  positive: { ring: "border-emerald-400/50", chip: "bg-emerald-400/10 text-emerald-300", glow: "rgba(34,197,94,0.45)", label: "Positive" },
  negative: { ring: "border-rose-400/50", chip: "bg-rose-400/10 text-rose-300", glow: "rgba(244,63,94,0.45)", label: "Negative" },
  uncertain: { ring: "border-amber-400/50", chip: "bg-amber-400/10 text-amber-300", glow: "rgba(250,204,21,0.45)", label: "Uncertain" },
  systemic: { ring: "border-sky-400/50", chip: "bg-sky-400/10 text-sky-300", glow: "rgba(96,165,250,0.45)", label: "Systemic" },
  neutral: { ring: "border-slate-400/50", chip: "bg-slate-400/10 text-slate-300", glow: "rgba(148,163,184,0.35)", label: "Neutral" },
};

export const FlowNode = memo(function FlowNode({ data, selected }: { data: FlowNodeData; selected?: boolean }) {
  const s = stateStyles[data.state] ?? stateStyles.neutral;
  const sign = data.impact >= 0 ? "+" : "";
  return (
    <div
      style={{ ["--glow-color" as never]: s.glow }}
      className={`relative w-[200px] rounded-2xl border bg-[#0F172A]/85 p-3 backdrop-blur-xl transition ${s.ring} ${
        selected ? "scale-[1.03]" : "hover:scale-[1.02]"
      } animate-pulse-glow animate-fade-in-up`}
    >
      {data.mutated && (
        <div className="absolute -top-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-violet-500 text-[8px] font-bold text-white uppercase tracking-wider">
          mutated
        </div>
      )}
      <Handle type="target" position={Position.Top} className="!h-2 !w-2 !border-0 !bg-sky-300/70" />
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl leading-none">{data.icon}</span>
          <div>
            <div className="text-sm font-semibold text-white">{data.title}</div>
            <div className="text-[10px] uppercase tracking-wider text-slate-500">{data.duration}</div>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] ${s.chip}`}>{s.label}</span>
      </div>
      <div className="mt-3 flex items-end justify-between">
        <div className={`text-2xl font-semibold ${data.impact >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {sign}{data.impact}
          <span className="ml-0.5 text-xs text-slate-500">impact</span>
        </div>
        <div className="text-[10px] uppercase tracking-wider text-slate-500">simulated</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!h-2 !w-2 !border-0 !bg-violet-300/70" />
    </div>
  );
});
