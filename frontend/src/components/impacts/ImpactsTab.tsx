"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  sectors: SectorImpact[];
  selected: string | null;
  onSelect: (s: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full md:w-52 shrink-0">
      <p className="text-xs text-slate-500 uppercase tracking-widest font-medium px-1 mb-1">Sectors</p>
      {sectors.map((s) => {
        const active = selected === s.sector;
        return (
          <button
            key={s.sector}
            onClick={() => onSelect(s.sector)}
            className={cn(
              "flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium",
              "border transition-all duration-200 text-left cursor-pointer",
              active
                ? "bg-blue-600/15 border-blue-500/40 text-blue-300"
                : "bg-white/2 border-white/6 text-slate-400 hover:text-slate-200 hover:border-white/15"
            )}
          >
            <span>{s.sector}</span>
            <ChevronRight className={cn("w-4 h-4 transition-transform", active ? "rotate-90" : "")} />
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

  return (
    <motion.div
      key={sector.sector}
      className="flex-1 space-y-4 min-w-0"
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="p-4 rounded-xl border border-white/8 bg-white/2">
        <h3 className="text-lg font-bold text-white mb-1" style={{ fontFamily: "Space Grotesk" }}>
          {sector.sector}
        </h3>
        <p className="text-sm text-slate-400 leading-relaxed">{sector.overview}</p>
        <div className="mt-3 flex items-center gap-2">
          <div className="text-xs text-slate-500">Confidence:</div>
          <div className="flex-1 h-1 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-700"
              style={{ width: `${sector.confidence_score * 100}%` }}
            />
          </div>
          <div className="text-xs text-blue-400">{Math.round(sector.confidence_score * 100)}%</div>
        </div>
      </div>

      {/* Positives + Negatives */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">Positive Effects</span>
          </div>
          <ul className="space-y-1.5">
            {sector.positive_effects.map((e, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-emerald-500 mt-0.5 shrink-0">+</span>{e}
              </li>
            ))}
          </ul>
        </div>

        <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
          <div className="flex items-center gap-2 mb-2.5">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm font-semibold text-red-400">Negative Effects</span>
          </div>
          <ul className="space-y-1.5">
            {sector.negative_effects.map((e, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-red-500 mt-0.5 shrink-0">-</span>{e}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <div className="p-4 rounded-xl border border-white/8 bg-white/2">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-medium mb-3">Impact Metrics</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={chartData} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}
                fill="url(#barGrad)"
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ripple Effects */}
      {sector.ripple_effects?.length > 0 && (
        <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-cyan-400">Ripple Effects</span>
          </div>
          <ul className="space-y-1.5">
            {sector.ripple_effects.map((r, i) => (
              <li key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                <span className="text-cyan-500 mt-0.5 shrink-0">→</span>{r}
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main ImpactsTab ──────────────────────────────────────────────────────────
export function ImpactsTab() {
  const { simulation } = useSimulationStore();
  const { selectedSector, setSector, isSectorLoading, setSectorLoading } = useUIStore();
  const [sectors, setSectors] = useState<SectorImpact[]>(simulation?.sector_impacts ?? []);
  const [activeSector, setActiveSector] = useState<SectorImpact | null>(
    (simulation?.sector_impacts?.[0]) ?? null
  );

  useEffect(() => {
    if (simulation?.sector_impacts?.length) {
      setSectors(simulation.sector_impacts);
      setActiveSector(simulation.sector_impacts[0]);
      setSector(simulation.sector_impacts[0].sector);
    }
  }, [simulation, setSector]);

  const handleSelect = async (sectorName: string) => {
    setSector(sectorName);
    const existing = sectors.find((s) => s.sector === sectorName);

    if (existing) {
      setActiveSector(existing);
      return;
    }

    // Fetch deep analysis
    if (!simulation) return;
    setSectorLoading(true);
    try {
      const deep = await sectorAnalysis(simulation.simulation_id, sectorName);
      setSectors((prev) => [...prev.filter((s) => s.sector !== sectorName), deep]);
      setActiveSector(deep);
    } catch (e) {
      console.error("Sector fetch failed:", e);
    } finally {
      setSectorLoading(false);
    }
  };

  if (!simulation) return null;

  return (
    <motion.div
      className="flex flex-col md:flex-row gap-4 h-full p-4 overflow-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <SectorSelector
        sectors={sectors}
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
          ) : activeSector ? (
            <SectorDetail key={activeSector.sector} sector={activeSector} />
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
