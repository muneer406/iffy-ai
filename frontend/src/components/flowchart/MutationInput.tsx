"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GitFork, Loader2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MutationInputProps {
  onMutate: (prompt: string) => void;
  isLoading: boolean;
}

export function MutationInput({ onMutate, isLoading }: MutationInputProps) {
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  const handle = () => {
    const t = value.trim();
    if (!t || isLoading) return;
    onMutate(t);
    setValue("");
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300",
        "bg-[#0f0f1a]/80 backdrop-blur-xl",
        focused
          ? "border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
          : "border-white/8"
      )}
    >
      <GitFork className="w-4 h-4 text-purple-400 shrink-0" />
      <span className="text-sm text-purple-400 font-medium shrink-0 hidden sm:block">What if also…</span>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handle()}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={isLoading}
        placeholder="Add a new condition to branch the simulation…"
        className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none disabled:opacity-50"
      />
      <motion.button
        onClick={handle}
        disabled={!value.trim() || isLoading}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
          value.trim() && !isLoading
            ? "bg-purple-600/80 hover:bg-purple-500 text-white cursor-pointer"
            : "bg-white/5 text-slate-600 cursor-not-allowed"
        )}
        whileTap={value.trim() && !isLoading ? { scale: 0.95 } : {}}
      >
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            </motion.div>
          ) : (
            <motion.div key="s" className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              Branch <ArrowRight className="w-3 h-3" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
