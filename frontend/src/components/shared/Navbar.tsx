"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, ExternalLink } from "lucide-react";
import { truncate } from "@/lib/utils";

interface NavbarProps {
  scenario?: string;
}

export function Navbar({ scenario }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/6 bg-[#09090f]/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-6 h-14 w-full">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-base tracking-tight text-white" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
            iffy<span className="text-blue-400">.ai</span>
          </span>
        </Link>

        {/* Scenario title */}
        {scenario && (
          <motion.div
            className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/8 bg-white/3"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="text-xs text-blue-400 font-medium">What if…</span>
            <span className="text-xs text-slate-300 font-medium">{truncate(scenario, 60)}</span>
          </motion.div>
        )}

        {/* Right */}
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-200"
          >
            New scenario
          </Link>
          <a
            href="https://github.com/Muneer320/iffy.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="w-8 h-8 rounded-lg border border-white/8 bg-white/3 flex items-center justify-center text-slate-500 hover:text-slate-200 hover:border-white/20 transition-all duration-200"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
