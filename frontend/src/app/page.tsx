"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ParticleBackground } from "@/components/landing/ParticleBackground";
import { HeroInput } from "@/components/landing/HeroInput";
import { SuggestionRows } from "@/components/landing/SuggestionRows";
import { simulate } from "@/lib/api/client";
import { useSimulationStore } from "@/store/simulation.store";
import { useHistoryStore } from "@/store/history.store";
import { Clock, ArrowRight } from "lucide-react";

const STATS = [
  { value: "∞", label: "Possible scenarios" },
  { value: "4", label: "Analysis dimensions" },
  { value: "AI", label: "Powered reasoning" },
];

function HistorySection() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { history } = useHistoryStore();
  const { setSimulation } = useSimulationStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || history.length === 0) return null;

  return (
    <motion.div
      className="w-full max-w-5xl mt-10"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-3 justify-center">
        <Clock className="w-4 h-4 text-slate-500" />
        <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Recent Simulations</span>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-4 justify-center flex-wrap max-w-full">
        {history.slice(0, 3).map((item) => (
          <button
            key={item.simulation_id}
            onClick={() => {
              setSimulation(item.data);
              router.push(`/simulate/${item.simulation_id}`);
            }}
            className="flex flex-col items-start gap-1 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer w-[280px] shrink-0 text-left"
          >
            <div className="text-sm font-semibold text-white truncate w-full" style={{ fontFamily: "Space Grotesk" }}>
              {item.title}
            </div>
            <div className="text-xs text-slate-400 truncate w-full">
              {item.scenario}
            </div>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

export default function LandingPage() {
  const router = useRouter();
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setSimulation, setLoading, reset } = useSimulationStore();

  const handleSubmit = async (scenario: string) => {
    let finalScenario = scenario.trim();
    if (!finalScenario.toLowerCase().startsWith("what if")) {
      finalScenario = `What if ${finalScenario.charAt(0).toLowerCase()}${finalScenario.slice(1)}`;
    }

    setIsLoading(true);
    setLoading(true);
    setError(null);
    reset();

    try {
      const result = await simulate(finalScenario);
      setSimulation(result);
      router.push(`/simulate/${result.simulation_id}`);
    } catch (err) {
      setError("Failed to generate simulation. Please try again.");
      setIsLoading(false);
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      <ParticleBackground />

      {/* Grid overlay */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Radial gradient hero glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(59,130,246,0.08) 0%, rgba(139,92,246,0.04) 40%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-16">
        {/* Logo */}
        <motion.div
          className="flex flex-col items-center gap-4 mb-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >

          {/* Logo text */}
          <h1
            className="text-7xl sm:text-8xl font-extrabold tracking-tighter"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            <span className="text-white">iffy</span>
            <span className="text-gradient">.ai</span>
          </h1>

          <p className="text-center text-slate-400 text-lg sm:text-xl max-w-xl leading-relaxed">
            Explore the ripple effects of any &ldquo;What If?&rdquo; scenario across technology,
            economics, society, and culture.
          </p>
        </motion.div>

        {/* Input */}
        <HeroInput 
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />

        {/* Error */}
        {error && (
          <motion.p
            className="mt-4 text-sm text-red-400 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {error}
          </motion.p>
        )}

        {/* History */}
        <HistorySection />

        {/* Stats */}
        <motion.div
          className="flex items-center gap-8 mt-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {STATS.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>
                {s.value}
              </span>
              <span className="text-xs text-slate-600">{s.label}</span>
            </div>
          ))}
        </motion.div>

        {/* Suggestions */}
        <motion.div
          className="w-full max-w-5xl mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <p className="text-center text-xs text-slate-600 mb-4 uppercase tracking-widest">Try these scenarios</p>
          <SuggestionRows onSelect={(text) => setInputValue(text)} />
        </motion.div>
      </div>
    </main>
  );
}
