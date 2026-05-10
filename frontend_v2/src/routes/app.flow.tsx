import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ConnectionLineType,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { FlowNode } from "@/components/flow/FlowNode";
import { useSimulationStore } from "@/lib/store";
import { mutate as apiMutate } from "@/lib/api";
import type { SimulationNode } from "@/lib/types";
import { Sparkles, ArrowRight, X, TrendingUp, TrendingDown, Zap, Loader2 } from "lucide-react";

export const Route = createFileRoute("/app/flow")({
  head: () => ({ meta: [{ title: "Systems Flow — iffy.ai" }] }),
  component: FlowPage,
});

const nodeTypes = { scenario: FlowNode };
type DurationKey = "immediate" | "short_term" | "long_term";
const durations: Array<{ key: DurationKey; label: string }> = [
  { key: "immediate", label: "Immediate" },
  { key: "short_term", label: "Short-Term" },
  { key: "long_term", label: "Long-Term" },
];

function FlowPage() {
  const navigate = useNavigate();
  const { simulation, isLoading, selectedDuration, setDuration, applyMutation, error } = useSimulationStore();

  const [selected, setSelected] = useState<SimulationNode | null>(null);
  const [mutation, setMutation] = useState("");
  const [mutating, setMutating] = useState(false);
  const [mutationInsight, setMutationInsight] = useState("");
  const [mutationError, setMutationError] = useState<string | null>(null);

  // Redirect to home if no simulation
  useEffect(() => {
    if (!simulation && !isLoading) navigate({ to: "/" });
  }, [simulation, isLoading, navigate]);

  const nodes: Node[] = useMemo(() => {
    if (!simulation) return [];
    return simulation.nodes.map((n, idx) => {
      const angle = (idx / simulation.nodes.length) * 2 * Math.PI;
      const radius = 280;
      const cx = 500, cy = 320;
      return {
        id: n.id,
        type: "scenario",
        position: { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) },
        data: {
          ...n,
          // Map to the FlowNode expected shape
          title: n.label,
          icon: "🔵",
          impact: n.duration[selectedDuration],
          state: n.impact_direction === "positive" ? "positive" : n.impact_direction === "negative" ? "negative" : "uncertain",
          duration: selectedDuration === "immediate" ? "Immediate" : selectedDuration === "short_term" ? "Short-Term" : "Long-Term",
          summary: n.description,
          positives: [],
          negatives: [],
          ripples: n.tags,
          mutated: n.mutated,
        },
      } as Node;
    });
  }, [simulation, selectedDuration]);

  const edges: Edge[] = useMemo(() => {
    if (!simulation) return [];
    const nodeIds = new Set(simulation.nodes.map((n) => n.id));
    return simulation.edges
      .filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))
      .map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        animated: true,
        type: "smoothstep",
        style: {
          stroke: e.relationship === "increase" || e.relationship === "enable"
            ? "rgba(52,211,153,0.6)"
            : e.relationship === "decrease" || e.relationship === "block" || e.relationship === "destabilize"
            ? "rgba(251,113,133,0.6)"
            : "rgba(99,102,241,0.55)",
          strokeWidth: 0.8 + e.strength * 0.4,
        },
      }));
  }, [simulation]);

  const onNodeClick = (_: unknown, n: Node) => {
    const found = simulation?.nodes.find((x) => x.id === n.id);
    if (found) setSelected(found);
  };

  const submitMutation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mutation.trim() || mutating || !simulation) return;
    const prompt = mutation.trim();
    setMutation("");
    setMutating(true);
    setMutationError(null);
    setMutationInsight("");
    try {
      const result = await apiMutate(simulation.simulation_id, simulation, prompt);
      applyMutation(result);
      setMutationInsight(result.mutation_summary);
    } catch (err) {
      setMutationError(err instanceof Error ? err.message : "Mutation failed");
    } finally {
      setMutating(false);
    }
  };

  if (isLoading || !simulation) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative w-14 h-14">
            <div className="absolute inset-0 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <p className="text-slate-300 font-semibold">Building your simulation…</p>
          <p className="text-slate-500 text-sm">Mapping cause-effect chains across systems</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-[1400px] gap-4 px-4 py-4 lg:grid-cols-[1fr_340px] sm:px-6">
      {/* Graph */}
      <div className="relative">
        {/* Title + Summary */}
        <div className="mb-3 rounded-2xl border border-white/8 bg-[#0F172A]/70 p-4 backdrop-blur-xl">
          <h1 className="text-lg font-semibold text-white">{simulation.title}</h1>
          <p className="mt-1 text-sm text-slate-400 leading-relaxed">{simulation.summary}</p>
        </div>

        {/* Duration picker */}
        <div className="absolute right-4 top-[90px] z-20 flex items-center gap-1 rounded-full border border-white/10 bg-[#0F172A]/80 p-1 backdrop-blur-xl">
          {durations.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setDuration(key)}
              className={`rounded-full px-3 py-1 text-xs transition ${
                selectedDuration === key
                  ? "bg-gradient-to-r from-sky-500 to-violet-500 text-white shadow-[0_0_18px_-4px_rgba(99,102,241,0.8)]"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="h-[560px] rounded-2xl border border-white/8 bg-[#080d1c]/60 backdrop-blur-xl overflow-hidden glow-border">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            connectionLineType={ConnectionLineType.SmoothStep}
            fitView
            fitViewOptions={{ padding: 0.2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background gap={28} size={1} color="rgba(148,163,184,0.18)" />
            <Controls position="bottom-right" showInteractive={false} />
            <MiniMap
              maskColor="rgba(5,8,22,0.7)"
              nodeColor={() => "#38BDF8"}
              style={{ background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}
              pannable
              zoomable
            />
          </ReactFlow>
        </div>

        {/* Mutation input */}
        <form onSubmit={submitMutation} className="mt-4">
          <div className="group relative">
            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-sky-500/30 to-violet-500/30 opacity-0 blur-xl transition group-focus-within:opacity-100" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0F172A]/80 px-4 py-3 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-sky-300 shrink-0" />
              <input
                value={mutation}
                onChange={(e) => setMutation(e.target.value)}
                placeholder="Add a follow-up condition…"
                className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
              />
              <button type="submit" disabled={mutating} className="btn-glow inline-flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-60 shrink-0">
                {mutating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {mutationInsight && (
            <div className="mt-2 rounded-xl border border-sky-400/20 bg-sky-400/5 px-3 py-2 text-xs text-sky-100 animate-fade-in">
              {mutationInsight}
            </div>
          )}
          {mutationError && (
            <div className="mt-2 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
              {mutationError}
            </div>
          )}
        </form>
      </div>

      {/* Insight rail */}
      <aside className="space-y-3 animate-fade-in">
        {/* Systems overview */}
        <div className="rounded-2xl border border-white/8 bg-[#0F172A]/80 p-4 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-3">Affected Systems</h3>
          <div className="flex flex-wrap gap-1.5">
            {simulation.systems.map((s) => (
              <span key={s} className="rounded-full border border-sky-400/30 bg-sky-400/10 px-2.5 py-1 text-xs text-sky-200">
                {s}
              </span>
            ))}
          </div>
        </div>

        {/* Timeline summary */}
        <div className="rounded-2xl border border-white/8 bg-[#0F172A]/80 p-4 backdrop-blur-xl">
          <h3 className="text-sm font-semibold text-white mb-3">Timeline · {durations.find(d => d.key === selectedDuration)?.label}</h3>
          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
            {(simulation.timeline[selectedDuration] ?? []).map((ev, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.02] p-2.5">
                <div className="text-xs font-semibold text-white">{ev.title}</div>
                <div className="mt-0.5 text-[11px] text-slate-400 leading-relaxed">{ev.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Selected node detail */}
        {selected && <NodeDetail node={selected} onClose={() => setSelected(null)} />}
      </aside>
    </div>
  );
}

function NodeDetail({ node, onClose }: { node: SimulationNode; onClose: () => void }) {
  const impactColor = node.impact_direction === "positive" ? "text-emerald-300" : node.impact_direction === "negative" ? "text-rose-300" : "text-amber-300";
  return (
    <div className="rounded-2xl border border-white/8 bg-[#0F172A]/80 p-4 backdrop-blur-xl animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div>
          <div className={`text-xs uppercase tracking-wider font-medium ${impactColor}`}>{node.impact_direction} · {Math.round(node.confidence * 100)}% confidence</div>
          <div className="mt-0.5 text-sm font-semibold text-white">{node.label}</div>
        </div>
        <button onClick={onClose} className="rounded-full p-1 text-slate-400 hover:bg-white/5 hover:text-white">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <p className="mt-2 text-xs text-slate-300 leading-relaxed">{node.description}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {(["immediate", "short_term", "long_term"] as const).map((d) => (
          <div key={d} className="rounded-lg bg-white/[0.03] p-2">
            <div className="text-[9px] uppercase tracking-wider text-slate-500">{d.replace("_", "-")}</div>
            <div className={`mt-0.5 text-sm font-semibold ${node.duration[d] >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
              {node.duration[d] > 0 ? "+" : ""}{node.duration[d]}
            </div>
          </div>
        ))}
      </div>
      {node.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {node.tags.map((t) => (
            <span key={t} className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-400">{t}</span>
          ))}
        </div>
      )}
    </div>
  );
}
