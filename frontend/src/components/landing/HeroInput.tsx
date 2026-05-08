"use client";
import { useState, useRef, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface HeroInputProps {
  value: string;
  onChange: (val: string) => void;
  onSubmit: (scenario: string) => void;
  isLoading: boolean;
}

export function HeroInput({ value, onChange, onSubmit, isLoading }: HeroInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed || isLoading) return;
    onSubmit(trimmed);
  };

  const handleKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Input container */}
      <motion.div
        className={cn(
          "relative rounded-2xl border transition-all duration-500",
          "bg-white/3 backdrop-blur-xl",
          focused
            ? "border-blue-500/60 shadow-[0_0_40px_rgba(59,130,246,0.2),0_0_80px_rgba(59,130,246,0.08)]"
            : "border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.3)]"
        )}
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {/* Prefix */}
        <div className="flex items-start gap-2 px-5 pt-5 pb-1">
          <Sparkles className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
          <span className="text-blue-400 font-semibold text-lg leading-tight shrink-0">
            What if…
          </span>
        </div>

        {/* Textarea */}
        <textarea
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKey}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={isLoading}
          placeholder="college degrees stopped mattering?"
          rows={2}
          className={cn(
            "w-full bg-transparent px-5 pb-4 text-lg text-white placeholder-slate-600",
            "resize-none outline-none border-none font-medium leading-relaxed",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          style={{ fontFamily: "inherit" }}
        />

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-5 pb-4">
          <span className="text-xs text-slate-600">
            {value.length > 0 ? `${value.length} chars · Press Enter to simulate` : "Describe any scenario"}
          </span>
          <motion.button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold",
              "transition-all duration-300",
              value.trim() && !isLoading
                ? "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 cursor-pointer"
                : "bg-white/5 text-slate-500 cursor-not-allowed"
            )}
            whileHover={value.trim() && !isLoading ? { scale: 1.03 } : {}}
            whileTap={value.trim() && !isLoading ? { scale: 0.97 } : {}}
          >
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Simulating…
                </motion.div>
              ) : (
                <motion.div
                  key="submit"
                  className="flex items-center gap-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Simulate
                  <ArrowRight className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      </motion.div>

      {/* Helper text */}
      <motion.p
        className="text-center text-xs text-slate-600 mt-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Powered by AI · Explore interconnected ripple effects · No sign-up required
      </motion.p>
    </div>
  );
}
