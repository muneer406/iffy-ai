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
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const active = isHovered || isFocused || isLoading || value.length > 0;

  const handle = () => {
    const t = value.trim();
    if (!t || isLoading) return;
    onMutate(t);
    setValue("");
  };

  return (
    <motion.div
      className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 pb-6"
      initial={{ y: "80%" }}
      animate={{ y: active ? 0 : "75%", opacity: active ? 1 : 0.6 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Hitbox extension so it's easier to hover from the bottom edge */}
      <div className="absolute inset-x-[-100px] top-[-40px] h-10 bg-transparent" />

      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all duration-300 w-[90vw] max-w-2xl shadow-[0_-20px_40px_rgba(0,0,0,0.5)]",
          "bg-[#0f0f1a]/95 backdrop-blur-xl",
          isFocused
            ? "border-purple-500/50 shadow-[0_0_20px_rgba(139,92,246,0.15)]"
            : "border-white/10"
        )}
      >
        <GitFork className={cn("w-5 h-5 shrink-0 transition-colors", active ? "text-purple-400" : "text-slate-500")} />
        <span className={cn("text-sm font-medium shrink-0 hidden sm:block transition-colors", active ? "text-purple-400" : "text-slate-500")}>
          What if also…
        </span>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handle()}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          placeholder="Add a new condition to branch the simulation…"
          className="flex-1 bg-transparent text-sm text-white placeholder-slate-600 outline-none disabled:opacity-50"
        />
        <motion.button
          onClick={handle}
          disabled={!value.trim() || isLoading}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
            value.trim() && !isLoading
              ? "bg-purple-600/80 hover:bg-purple-500 text-white cursor-pointer"
              : "bg-white/5 text-slate-600 cursor-not-allowed"
          )}
          whileTap={value.trim() && !isLoading ? { scale: 0.95 } : {}}
        >
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 className="w-4 h-4 animate-spin" />
              </motion.div>
            ) : (
              <motion.div key="s" className="flex items-center gap-1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Branch <ArrowRight className="w-3.5 h-3.5" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </motion.div>
  );
}
