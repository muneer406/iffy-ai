import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { getMarketplaceItems } from "@/lib/api";
import { Heart, Search } from "lucide-react";

export const Route = createFileRoute("/marketplace")({
  head: () => ({
    meta: [
      { title: "Scenario Marketplace — iffy.ai" },
      { name: "description", content: "Discover and remix public 'what if' simulations." },
    ],
  }),
  component: MarketplacePage,
});

const categories = ["All","Economy","Tech","Climate","Health","Policy","Society","Space"];

function MarketplacePage() {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const [marketplaceItems, setMarketplaceItems] = useState<any[]>([]);

  useEffect(() => {
    getMarketplaceItems().then(setMarketplaceItems).catch(console.error);
  }, []);

  const items = marketplaceItems.filter(
    (m) => (cat === "All" || m.tags.includes(cat)) && m.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="bg-app min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="text-center">
          <div className="text-xs uppercase tracking-wider text-slate-500">Public</div>
          <h1 className="text-balance text-4xl font-semibold text-white">Scenario marketplace</h1>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Explore and remix simulations crafted by the iffy.ai community.
          </p>
        </header>

        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="relative w-full max-w-xl">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search public simulations…"
              className="w-full rounded-2xl border border-white/10 bg-black/60 py-3 pl-11 pr-4 text-sm text-white placeholder:text-slate-500 outline-none backdrop-blur-xl focus:border-white/40"
            />
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((c) => (
              <button key={c} onClick={() => setCat(c)} className={`rounded-full border px-3 py-1 text-xs transition ${
                cat === c
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/[0.02] text-slate-400 hover:text-white"
              }`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((m) => (
            <article key={m.id} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl transition hover:scale-[1.01] hover:border-white/30">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white opacity-5 blur-2xl transition group-hover:opacity-10" />
              <div className="relative flex items-center justify-between text-[10px] uppercase tracking-wider text-slate-500">
                <span>{m.creator}</span>
                <span className="inline-flex items-center gap-1 text-white/60"><Heart className="h-3 w-3" />{m.likes}</span>
              </div>
              <h3 className="relative mt-2 text-base font-semibold text-white">{m.title}</h3>
              <p className="relative mt-1 text-sm text-slate-400 line-clamp-2">{m.summary}</p>
              <div className="relative mt-3 flex flex-wrap gap-1.5">
                {m.tags.map((t) => (
                  <span key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] text-slate-300">{t}</span>
                ))}
              </div>
              <Link to="/app/flow" search={{ q: m.title }} className="relative mt-4 inline-flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] py-2 text-sm text-white hover:bg-white/[0.07]">
                Explore
              </Link>
            </article>
          ))}
        </div>
      </main>
    </div>
  );
}
