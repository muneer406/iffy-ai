"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/shared/Navbar";
import { TabNav } from "@/components/simulation/TabNav";
import { FlowchartTab } from "@/components/flowchart/FlowchartTab";
import { ImpactsTab } from "@/components/impacts/ImpactsTab";
import { DebateTab } from "@/components/debate/DebateTab";
import { useSimulationStore } from "@/store/simulation.store";
import { useUIStore } from "@/store/ui.store";
import { debate, sectorAnalysis } from "@/lib/api/client";

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton() {
  return (
    <div className="flex flex-col h-screen pt-14">
      <div className="p-4 border-b border-white/6 flex items-center justify-between">
        <div className="h-5 w-48 shimmer rounded-lg" />
        <div className="h-9 w-72 shimmer rounded-xl" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20 border-t-blue-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
          </div>
          <div className="text-center">
            <p className="text-slate-300 font-semibold text-lg" style={{ fontFamily: "Space Grotesk" }}>
              Building your simulation
            </p>
            <p className="text-slate-600 text-sm mt-1">
              Mapping cause-effect chains across systems…
            </p>
          </div>
          <div className="flex gap-1.5">
            {["Nodes", "Edges", "Timeline", "Debate"].map((s, i) => (
              <motion.div
                key={s}
                className="px-3 py-1 rounded-full text-xs border border-white/8 bg-white/3 text-slate-500"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              >
                {s}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab content ──────────────────────────────────────────────────────────────
function TabContent() {
  const { activeTab } = useUIStore();
  return (
    <AnimatePresence mode="wait">
      {activeTab === "flowchart" && <FlowchartTab key="flowchart" />}
      {activeTab === "impacts" && <ImpactsTab key="impacts" />}
      {activeTab === "debate" && <DebateTab key="debate" />}
    </AnimatePresence>
  );
}

export default function SimulatePage() {
  const params = useParams();
  const { simulation, isLoading, updateDebate, addSectorImpact } = useSimulationStore();
  const { setTab, setDebateLoading, setSectorLoading } = useUIStore();

  const scenario = simulation?.metadata?.scenario ?? simulation?.title;

  // Reset tab on new simulation and trigger background loads
  useEffect(() => {
    if (!simulation) return;
    setTab("flowchart");

    // Progressive loading: Debate
    if (!simulation.debate_participants || simulation.debate_participants.length === 0) {
      setDebateLoading(true);
      debate(simulation.simulation_id, [], [], scenario ?? "")
        .then((res) => updateDebate(res.participants, res.messages))
        .catch(console.error)
        .finally(() => setDebateLoading(false));
    }

    // Progressive loading: Sector
    if ((!simulation.sector_impacts || simulation.sector_impacts.length === 0) && simulation.systems?.length > 0) {
      setSectorLoading(true);
      sectorAnalysis(simulation.simulation_id, simulation.systems[0])
        .then((res) => addSectorImpact(res))
        .catch(console.error)
        .finally(() => setSectorLoading(false));
    }
  }, [simulation?.simulation_id, setTab]);

  if (isLoading || !simulation) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#09090f]">
      <Navbar scenario={scenario} />
      
      {/* Floating Sidebar */}
      <TabNav />

      {/* Header */}
      <div className="pt-20 pb-6 px-16 shrink-0 relative z-10 flex flex-col items-center text-center">
        {/* Glow effect */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[100px] bg-blue-500/10 blur-[60px] pointer-events-none rounded-full" />
        
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl">
          <h1
            className="text-3xl md:text-4xl font-bold text-white mb-3"
            style={{ fontFamily: "Space Grotesk" }}
          >
            {simulation.title}
          </h1>
          <p className="text-sm md:text-base text-slate-400 leading-relaxed max-w-3xl mx-auto">
            {simulation.summary}
          </p>
        </motion.div>
      </div>

      {/* Tab content area */}
      <div className="flex-1 overflow-hidden relative z-0">
        <TabContent />
      </div>
    </div>
  );
}
