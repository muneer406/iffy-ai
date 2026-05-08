"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation.store";
import type { DurationKey } from "@/types/simulation";

const DURATIONS: { key: DurationKey; label: string; short: string }[] = [
  { key: "immediate", label: "Immediate", short: "Now" },
  { key: "short_term", label: "Short-Term", short: "1-2yr" },
  { key: "long_term", label: "Long-Term", short: "5-20yr" },
];

export function DurationToggle() {
  const { selectedDuration, setDuration } = useSimulationStore();

  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-lg border border-white/8 bg-white/3">
      {DURATIONS.map((d) => {
        const active = selectedDuration === d.key;
        return (
          <button
            key={d.key}
            onClick={() => setDuration(d.key)}
            className={cn(
              "relative px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer",
              active ? "text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {active && (
              <motion.div
                layoutId="duration-bg"
                className="absolute inset-0 rounded-md bg-cyan-600/20 border border-cyan-500/30"
                transition={{ type: "spring", stiffness: 600, damping: 40 }}
              />
            )}
            <span className="relative z-10 hidden sm:block">{d.label}</span>
            <span className="relative z-10 sm:hidden">{d.short}</span>
          </button>
        );
      })}
    </div>
  );
}
