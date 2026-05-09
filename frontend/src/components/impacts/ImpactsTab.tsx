"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
} from "recharts";
import { TrendingUp, TrendingDown, Zap, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation.store";
import { useUIStore } from "@/store/ui.store";
import { sectorAnalysis } from "@/lib/api/client";
import type { SectorImpact } from "@/types/simulation";

// ─── Sector Selector ──────────────────────────────────────────────────────────
function SectorSelector({ sectors, selected, onSelect }: {
  sectors: string[];
  selected: string | null;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2 w-full shrink-0 mb-4 pb-2 border-b border-white/6">
      {sectors.map((sector) => {
        const active = selected === sector;
        return (
          <button
            key={sector}
            onClick={() => onSelect(sector)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer border",
              active
                ? "bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
            )}
          >
            {sector}
          </button>
        );
      })}
    </div>
  );
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: {active?: boolean; payload?: Array<{value: number}>; label?: string}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg border border-white/10 bg-[#13131f] text-xs text-slate-200">
      <p className="font-medium">{label}</p>
      <p className="text-blue-400">{payload[0]?.value}%</p>
    </div>
  );
}

// ─── Sector Detail ────────────────────────────────────────────────────────────
function SectorDetail({ sector }: { sector: SectorImpact }) {
  const chartData = sector.metrics.map((m) => ({
    name: m.name.length > 16 ? m.name.slice(0, 14) + "…" : m.name,
    value: m.direction === "decrease" ? -m.magnitude : m.magnitude,
    confidence: Math.round(m.confidence * 100),
  }));

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
  };

  return (
    <motion.div
      key={sector.sector}
      className="flex-1 space-y-4 min-w-0"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md shadow-lg shadow-black/20">
        <h3 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>
          {sector.sector}
        </h3>
        <p className="text-sm md:text-base text-slate-300 leading-relaxed">{sector.overview}</p>
      </motion.div>

      {/* Positives + Negatives */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-base font-semibold text-emerald-400">Positive Effects</span>
          </div>
          <ul className="space-y-2">
            {sector.positive_effects.map((e, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 mt-0.5 shrink-0 text-lg leading-none">+</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-5 rounded-2xl border border-red-500/20 bg-red-500/5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-red-500/20">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-base font-semibold text-red-400">Negative Effects</span>
          </div>
          <ul className="space-y-2">
            {sector.negative_effects.map((e, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-red-500 mt-0.5 shrink-0 text-lg leading-none">-</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* Chart */}
      {chartData.length > 0 && (
        <motion.div variants={itemVariants} className="p-5 rounded-2xl border border-white/10 bg-white/5 shadow-lg shadow-black/10">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">Impact Metrics</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 20, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#barGrad)">
                {/* Recharts animation for the bar growing */}
              </Bar>
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* Ripple Effects */}
      {sector.ripple_effects?.length > 0 && (
        <motion.div variants={itemVariants} className="p-5 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 shadow-lg shadow-black/10">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-base font-semibold text-cyan-400">Ripple Effects</span>
          </div>
          <ul className="space-y-2">
            {sector.ripple_effects.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-cyan-500 mt-0.5 shrink-0 text-lg leading-none">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main ImpactsTab ──────────────────────────────────────────────────────────
export function ImpactsTab() {
  const { simulation, addSectorImpact } = useSimulationStore();
  const { selectedSector, setSector, isSectorLoading, setSectorLoading } = useUIStore();
  
  // Available sectors are the 'systems' from the simulation
  const sectorNames = simulation?.systems ?? [];
  const fetchedImpacts = simulation?.sector_impacts ?? [];

  const activeSectorData = fetchedImpacts.find(s => s.sector === selectedSector) || null;

  // Initialize selected sector
  useEffect(() => {
    if (!selectedSector && sectorNames.length > 0) {
      setSector(sectorNames[0]);
    }
  }, [sectorNames, selectedSector, setSector]);

  const handleSelect = async (sectorName: string) => {
    setSector(sectorName);
    const existing = fetchedImpacts.find((s) => s.sector === sectorName);

    if (existing) {
      return; // Already fetched
    }

    // Fetch deep analysis
    if (!simulation) return;
    setSectorLoading(true);
    try {
      const deep = await sectorAnalysis(simulation.simulation_id, sectorName);
      addSectorImpact(deep);
    } catch (e) {
      console.error("Sector fetch failed:", e);
    } finally {
      setSectorLoading(false);
    }
  };

  if (!simulation) return null;

  return (
    <motion.div
      className="flex flex-col h-full p-6 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SectorSelector
        sectors={sectorNames}
        selected={selectedSector}
        onSelect={handleSelect}
      />

      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          {isSectorLoading ? (
            <motion.div
              key="loading"
              className="flex items-center justify-center h-64"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-sm text-slate-500">Analyzing sector…</span>
              </div>
            </motion.div>
          ) : activeSectorData ? (
            <SectorDetail key={activeSectorData.sector} sector={activeSectorData} />
          ) : (
            <motion.div
              key="loading-initial"
              className="flex items-center justify-center h-64"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-7 h-7 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                <span className="text-sm text-slate-500">Generating impact data…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
