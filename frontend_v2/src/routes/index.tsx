import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { ArrowRight, Clock, Sparkles, Compass, Users, Bookmark } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Particles } from "@/components/Particles";
import { promptExamples } from "@/lib/mock-data";
import { simulate } from "@/lib/api";
import { useSimulationStore, type HistoryItem } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iffy.ai — Explore the ripple effects of What If?" },
      {
        name: "description",
        content: "iffy.ai turns any 'What if...' scenario into an interactive simulation across systems, sectors, and stakeholders.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const { setSimulation, setLoading, setError, reset, history, loadFromHistory } = useSimulationStore();
  const [value, setValue] = useState("");
  const [loading, setLocalLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const submit = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    let scenario = trimmed;
    if (!scenario.toLowerCase().startsWith("what if")) {
      scenario = `What if ${scenario.charAt(0).toLowerCase()}${scenario.slice(1)}`;
    }

    setLocalLoading(true);
    setErrorMsg(null);
    reset();
    setLoading(true);

    try {
      const result = await simulate(scenario);
      setSimulation(result);
      setLoading(false);
      navigate({ to: "/app/flow" });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to generate simulation. Please try again.";
      setErrorMsg(msg);
      setError(msg);
      setLoading(false);
      setLocalLoading(false);
    }
  };

  const handleHistoryClick = (item: HistoryItem) => {
    loadFromHistory(item);
    navigate({ to: "/app/flow" });
  };

  return (
    <div className="bg-app relative min-h-screen overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-40" />
      <Particles count={50} />

      {/* Animated orbital rings */}
      <div className="pointer-events-none absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2">
        <div className="orbit orbit-1" />
        <div className="orbit orbit-2" />
        <div className="orbit orbit-3" />
      </div>

      {/* Aurora sweep */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[60vh] aurora" />

      <div className="relative mx-auto flex min-h-screen max-w-[1400px] flex-col px-6">
        <header className="flex items-center justify-between py-6">
          <Logo size="md" />
          <nav className="flex items-center gap-1">
            <Link to="/saved" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-400 hover:text-white transition">
              <Bookmark className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Saved</span>
            </Link>
            <Link to="/marketplace" className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-slate-400 hover:text-white transition">
              <Compass className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Marketplace</span>
            </Link>
            <Link to="/community" className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white hover:bg-white/10 transition">
              <Users className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Community</span>
            </Link>
          </nav>
        </header>

        <main className="flex flex-1 flex-col items-center justify-center pb-24 pt-10 text-center animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 animate-float">
            <Sparkles className="h-3 w-3 text-sky-300" />
            AI-powered scenario simulation
          </div>

          <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-7xl">
            <span className="text-gradient inline-block animate-gradient-x">What if</span>
            <span className="text-white">…</span>
          </h1>
          <p className="mt-4 max-w-xl text-balance text-base text-slate-400 sm:text-lg">
            Explore the ripple effects of any hypothetical across systems, sectors, and stakeholders.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit(value);
            }}
            className="group relative mt-10 w-full max-w-2xl"
          >
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-sky-500/40 via-violet-500/40 to-cyan-400/40 opacity-60 blur-2xl transition group-focus-within:opacity-100 animate-pulse-glow" />
            <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-[#0F172A]/80 px-5 py-4 backdrop-blur-xl glow-border">
              <span className="text-base font-medium text-slate-400">What if</span>
              <input
                autoFocus
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="AI replaces teachers…"
                className="flex-1 bg-transparent text-base text-white placeholder:text-slate-500 outline-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-glow inline-flex h-10 w-10 items-center justify-center rounded-xl disabled:opacity-60"
                aria-label="Run simulation"
              >
                {loading ? (
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                ) : (
                  <ArrowRight className="h-4 w-4" />
                )}
              </button>
            </div>
            {loading && (
              <div className="mt-4 text-sm text-slate-400 animate-fade-in">
                <span className="text-gradient-cyan">Initializing simulation</span>… modeling cascades across systems
              </div>
            )}
            {errorMsg && (
              <div className="mt-3 rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
                {errorMsg}
              </div>
            )}
          </form>

          {/* Recent History */}
          {mounted && history.length > 0 && (
            <div className="mt-8 w-full max-w-2xl">
              <div className="flex items-center gap-2 justify-center mb-3">
                <Clock className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-medium">Recent Simulations</span>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {history.slice(0, 3).map((item) => (
                  <button
                    key={item.simulation_id}
                    onClick={() => handleHistoryClick(item)}
                    className="flex flex-col items-start gap-1 px-4 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-left w-[260px] shrink-0"
                  >
                    <div className="text-sm font-semibold text-white truncate w-full">{item.title}</div>
                    <div className="text-xs text-slate-400 truncate w-full">{item.scenario}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Marquee chips */}
          <div className="mt-10 w-full space-y-3 overflow-hidden">
            <MarqueeRow items={promptExamples.slice(0, 6)} onPick={submit} />
            <MarqueeRow items={promptExamples.slice(6)} reverse onPick={submit} />
          </div>
        </main>

        <footer className="py-6 text-center text-xs text-slate-500">iffy.ai — every "what if" has consequences.</footer>
      </div>
    </div>
  );
}

function MarqueeRow({ items, reverse, onPick }: { items: string[]; reverse?: boolean; onPick: (s: string) => void }) {
  const doubled = [...items, ...items];
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#050816] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#050816] to-transparent" />
      <div
        className={`flex w-max gap-3 ${reverse ? "animate-marquee-reverse" : "animate-marquee"}`}
        style={{ animationDuration: reverse ? "55s" : "45s" }}
      >
        {doubled.map((p, i) => (
          <button
            key={i}
            onClick={() => onPick(p)}
            className="group relative whitespace-nowrap rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300 transition hover:border-sky-400/40 hover:bg-white/10 hover:text-white"
          >
            <span className="text-slate-500">What if </span>
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
