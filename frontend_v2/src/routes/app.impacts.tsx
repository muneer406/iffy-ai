import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useSimulationStore } from "@/lib/store";
import { sectorAnalysis } from "@/lib/api";
import type { SectorImpact } from "@/lib/types";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp, TrendingDown, Zap, Loader2, Info } from "lucide-react";

export const Route = createFileRoute("/app/impacts")({
  head: () => ({ meta: [{ title: "Impact Analysis — iffy.ai" }] }),
  component: ImpactsPage,
});

function ImpactsPage() {
  const navigate = useNavigate();
  const { simulation, isLoading, addSectorImpact, isSectorLoading, setSectorLoading } = useSimulationStore();

  const [selectedSector, setSelectedSector] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Redirect if no simulation
  useEffect(() => {
    if (!simulation && !isLoading) navigate({ to: "/" });
  }, [simulation, isLoading, navigate]);

  // Auto-select first sector
  useEffect(() => {
    if (simulation && !selectedSector && simulation.systems.length > 0) {
      handleSelectSector(simulation.systems[0]);
    }
  }, [simulation]);

  const fetchedImpacts = simulation?.sector_impacts ?? [];
  const activeSectorData = fetchedImpacts.find((s) => s.sector === selectedSector) ?? null;

  const handleSelectSector = async (sectorName: string) => {
    setSelectedSector(sectorName);
    setError(null);

    const existing = fetchedImpacts.find((s) => s.sector === sectorName);
    if (existing) return;

    if (!simulation) return;
    setSectorLoading(true);
    try {
      const data = await sectorAnalysis(simulation.simulation_id, sectorName);
      addSectorImpact(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load sector data");
    } finally {
      setSectorLoading(false);
    }
  };

  if (!simulation) return null;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6">
      {/* Sector chips */}
      <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/6">
        {simulation.systems.map((sector) => {
          const active = selectedSector === sector;
          const hasFetched = fetchedImpacts.some((s) => s.sector === sector);
          return (
            <button
              key={sector}
              onClick={() => handleSelectSector(sector)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                active
                  ? "bg-blue-600/20 border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                  : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/10"
              }`}
            >
              {sector}
              {hasFetched && !active && <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 align-middle" />}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {isSectorLoading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
          <p className="text-slate-400 text-sm">Analyzing {selectedSector}…</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/30 bg-rose-400/10 p-6 text-rose-200 text-sm text-center">
          {error}
        </div>
      ) : !activeSectorData ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="h-8 w-8 text-sky-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading sector data…</p>
        </div>
      ) : (
        <SectorDetail sector={activeSectorData} />
      )}
    </div>
  );
}

function SectorDetail({ sector }: { sector: SectorImpact }) {
  const chartData = sector.metrics.map((m) => ({
    name: m.name,
    value: m.direction === "decrease" ? -m.magnitude : m.magnitude,
  }));

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold text-white">{sector.sector}</h2>
        <p className="mt-2 text-sm md:text-base text-slate-300 leading-relaxed">{sector.overview}</p>
      </div>

      {/* Positive / Negative */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-base font-semibold text-emerald-400">Positive Effects</span>
          </div>
          <ul className="space-y-2">
            {sector.positive_effects.map((e, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-emerald-500 shrink-0 text-lg leading-none">+</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-rose-500/20">
              <TrendingDown className="w-5 h-5 text-rose-400" />
            </div>
            <span className="text-base font-semibold text-rose-400">Negative Effects</span>
          </div>
          <ul className="space-y-2">
            {sector.negative_effects.map((e, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-rose-500 shrink-0 text-lg leading-none">-</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Charts */}
      {chartData.length > 0 && (
        <div className="rounded-2xl border border-white/10 bg-[#0F172A]/70 p-5 backdrop-blur-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">Impact Metrics</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 60, left: -20 }}>
              <CartesianGrid stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8" }} angle={-45} textAnchor="end" axisLine={false} tickLine={false} dy={10} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} dx={-10} />
              <Tooltip contentStyle={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, color: "#fff" }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="url(#impactGrad)" />
              <defs>
                <linearGradient id="impactGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.4} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Ripple effects */}
      {sector.ripple_effects?.length > 0 && (
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-cyan-500/20">
              <Zap className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="text-base font-semibold text-cyan-400">Ripple Effects</span>
          </div>
          <ul className="space-y-2">
            {sector.ripple_effects.map((r, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2 leading-relaxed">
                <span className="text-cyan-500 shrink-0 text-lg leading-none">→</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
