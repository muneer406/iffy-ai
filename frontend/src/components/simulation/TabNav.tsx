"use client";
import { useState } from "react";
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex flex-col items-start"
      initial={{ x: "-80%" }}
      animate={{ x: isHovered ? 0 : "-80%" }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hitbox extension so it's easier to hover from the left edge */}
      <div className="absolute inset-y-[-100px] right-[-40px] w-10 bg-transparent" />

      <div className="flex flex-col gap-2 p-2 rounded-r-2xl border-y border-r border-white/10 bg-[#0f0f1a]/95 backdrop-blur-xl shadow-[20px_0_40px_rgba(0,0,0,0.5)]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setTab(tab.key)}
              className={cn(
                "relative flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300 w-48 cursor-pointer",
                active ? "bg-blue-600/10" : "hover:bg-white/5"
              )}
            >
              {active && (
                <motion.div
                  layoutId="tab-sidebar-bg"
                  className="absolute inset-0 rounded-xl border border-blue-500/30"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
              
              {/* Icon is aligned to the right edge when tucked, so we put it on the far right of the button or reverse flex? Actually, when x is -80%, the right 20% is visible. So the icon should be on the RIGHT side of the button! */}
              <div className="flex-1 min-w-0">
                <div className={cn("text-sm font-semibold", active ? "text-white" : "text-slate-400")}>{tab.label}</div>
                <div className="text-[10px] text-slate-500">{tab.description}</div>
              </div>
              <Icon className={cn("w-5 h-5 shrink-0 transition-colors", active ? "text-blue-400" : "text-slate-500")} />
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}
