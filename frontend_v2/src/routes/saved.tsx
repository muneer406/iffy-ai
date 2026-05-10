import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getSavedScenarios } from "@/lib/api";
import { Copy, Trash2, ExternalLink, Star } from "lucide-react";

export const Route = createFileRoute("/saved")({
  head: () => ({ meta: [{ title: "Saved simulations — iffy.ai" }] }),
  component: SavedPage,
});

function SavedPage() {
  const [filter, setFilter] = useState<"recent" | "viewed" | "favorites">("recent");
  const [savedScenarios, setSavedScenarios] = useState<any[]>([]);

  useEffect(() => {
    getSavedScenarios().then(setSavedScenarios).catch(console.error);
  }, []);
  return (
    <div className="bg-app min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Library</div>
            <h1 className="text-3xl font-semibold text-white">Saved simulations</h1>
            <p className="mt-1 text-sm text-slate-400">Your private collection of explored futures.</p>
          </div>
          <div className="flex items-center gap-1 rounded-full border border-white/10 bg-black/60 p-1 backdrop-blur-xl">
            {(["recent","viewed","favorites"] as const).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`rounded-full px-3 py-1 text-xs capitalize transition ${
                filter === f ? "bg-white text-black" : "text-slate-400 hover:text-white"
              }`}>{f}</button>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {savedScenarios.map((s) => (
            <article key={s.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl transition hover:border-white/30">
              <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white opacity-5 blur-2xl transition group-hover:opacity-10" />
              <div className="relative">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                  <span>{s.updated}</span>
                  <Star className="h-3.5 w-3.5 text-slate-500 hover:text-amber-300" />
                </div>
                <h3 className="mt-2 text-base font-semibold text-white">{s.title}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-400">{s.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {s.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-300">{t}</span>
                  ))}
                </div>
                <Sparkline />
                <div className="mt-4 flex items-center justify-between">
                  <Link to="/app/flow" search={{ q: s.title }} className="inline-flex items-center gap-1.5 text-sm text-white hover:text-white/80">
                    Open <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                  <div className="flex items-center gap-1 text-slate-400">
                    <button className="rounded-md p-1 hover:bg-white/5"><Copy className="h-3.5 w-3.5" /></button>
                    <button className="rounded-md p-1 hover:bg-white/5 hover:text-rose-300"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}

function Sparkline() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pts = Array.from({ length: 16 }).map((_, i) => 20 + Math.sin(i * 0.6) * 8 + (mounted ? Math.random() * 6 : 3));
  const path = pts.map((y, i) => `${i === 0 ? "M" : "L"} ${i * 8} ${y}`).join(" ");
  return (
    <svg viewBox="0 0 120 40" className="mt-3 h-10 w-full">
      <defs>
        <linearGradient id="sl" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#888888" />
          <stop offset="100%" stopColor="#ffffff" />
        </linearGradient>
      </defs>
      <path d={path} fill="none" stroke="url(#sl)" strokeWidth="1.6" />
    </svg>
  );
}
