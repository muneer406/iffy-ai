"use client";
import { motion } from "framer-motion";
import { GitBranch, BarChart3, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import type { TabKey } from "@/types/simulation";

const TABS: { key: TabKey; label: string; icon: React.ElementType; description: string }[] = [
  { key: "flowchart", label: "Flowchart", icon: GitBranch, description: "Systems view" },
  { key: "impacts", label: "Impacts", icon: BarChart3, description: "Sector analysis" },
  { key: "debate", label: "Debate", icon: MessageSquare, description: "Perspectives" },
];

export function TabNav() {
  const { activeTab, setTab } = useUIStore();

  return (
    <div className="flex items-center gap-1 p-1 rounded-xl border border-white/8 bg-white/3 backdrop-blur-sm">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const active = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={cn(
              "relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium",
              "transition-colors duration-200 cursor-pointer",
              active ? "text-white" : "text-slate-500 hover:text-slate-300"
            )}
          >
            {active && (
              <motion.div
                layoutId="tab-bg"
                className="absolute inset-0 rounded-lg bg-blue-600/20 border border-blue-500/30"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon className="w-4 h-4 relative z-10" />
            <span className="relative z-10">{tab.label}</span>
            <span className={cn(
              "relative z-10 hidden sm:block text-xs",
              active ? "text-blue-400" : "text-slate-600"
            )}>
              {tab.description}
            </span>
          </button>
        );
      })}
    </div>
  );
}
