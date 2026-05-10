import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Flame, MessageSquare, Repeat2, Sparkles, X, Plus } from "lucide-react";
import { submitCommunityPost, getCommunityFeed } from "@/lib/api";
import type { featuredCreators, recentDiscussions, marketplaceItems } from "@/lib/mock-data";

export const Route = createFileRoute("/community")({
  head: () => ({ meta: [{ title: "Community — iffy.ai" }] }),
  component: CommunityPage,
});

type Modal =
  | { kind: "creator"; data: typeof featuredCreators[number] }
  | { kind: "discussion"; data: typeof recentDiscussions[number] }
  | { kind: "remix"; data: typeof marketplaceItems[number] }
  | { kind: "post" }
  | null;

function CommunityPage() {
  const [modal, setModal] = useState<Modal>(null);
  const [feed, setFeed] = useState({
    trending: [] as any[],
    marketplaceItems: [] as any[],
    recentDiscussions: [] as any[],
    featuredCreators: [] as any[]
  });

  useEffect(() => {
    getCommunityFeed().then(setFeed).catch(console.error);
  }, []);

  return (
    <div className="bg-app min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-[1200px] px-6 py-10">
        <header className="flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-500">Live</div>
            <h1 className="text-3xl font-semibold text-white">Community pulse</h1>
            <p className="mt-1 text-sm text-slate-400">What the world is wondering right now.</p>
          </div>
          <button
            onClick={() => setModal({ kind: "post" })}
            className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white hover:bg-white hover:text-black transition"
          >
            <Plus className="h-4 w-4" />
            Share scenario
          </button>
        </header>

        {/* Direct publish scenario form */}
        <DirectPublishForm />

        <section className="mt-8 grid gap-4 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <SectionTitle icon={Flame}>Trending simulations</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-2">
              {feed.trending.map((t) => (
                <Link key={t.id} to="/app/flow" search={{ q: t.title }} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-black/60 p-5 backdrop-blur-xl transition hover:border-white/30">
                  <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white opacity-5 blur-2xl transition group-hover:opacity-10" />
                  <div className="relative text-[10px] uppercase tracking-wider text-slate-500">{t.engagement} explorers</div>
                  <h3 className="relative mt-1 text-base font-semibold text-white">What if {t.title}?</h3>
                  <p className="relative mt-1 text-sm text-slate-400">{t.preview}</p>
                  <div className="relative mt-3 text-xs text-slate-300">{t.reactions}</div>
                </Link>
              ))}
            </div>

            <SectionTitle icon={Repeat2}>Popular remixes</SectionTitle>
            <div className="grid gap-3 sm:grid-cols-3">
              {feed.marketplaceItems.slice(0, 3).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setModal({ kind: "remix", data: m })}
                  className="text-left rounded-2xl border border-white/10 bg-black/60 p-4 backdrop-blur-xl transition hover:border-white/30 hover:scale-[1.01]"
                >
                  <div className="text-[10px] uppercase tracking-wider text-slate-500">{m.creator}</div>
                  <div className="mt-1 text-sm font-medium text-white">{m.title}</div>
                  <div className="mt-2 text-xs text-slate-400">{m.likes} remixes</div>
                </button>
              ))}
            </div>
          </div>

          <aside className="space-y-3">
            <SectionTitle icon={MessageSquare}>Recent discussions</SectionTitle>
            <div className="space-y-2">
              {feed.recentDiscussions.map((d) => (
                <button
                  key={d.id}
                  onClick={() => setModal({ kind: "discussion", data: d })}
                  className="w-full text-left rounded-2xl border border-white/10 bg-black/60 p-3 backdrop-blur-xl transition hover:border-white/30"
                >
                  <div className="text-xs font-medium text-white">{d.who}</div>
                  <div className="mt-0.5 text-xs text-slate-400">{d.text}</div>
                </button>
              ))}
            </div>

            <SectionTitle icon={Sparkles}>Featured creators</SectionTitle>
            <div className="grid grid-cols-3 gap-2">
              {feed.featuredCreators.map((u) => (
                <button
                  key={u.handle}
                  onClick={() => setModal({ kind: "creator", data: u })}
                  className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-black/60 p-3 text-center transition hover:border-white/30 hover:scale-[1.02]"
                >
                  <div className={`h-9 w-9 rounded-full bg-white/20`} />
                  <div className="truncate text-[11px] text-slate-300">{u.handle}</div>
                </button>
              ))}
            </div>
          </aside>
        </section>
      </main>

      {modal && <Modal modal={modal} onClose={() => setModal(null)} />}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-400">
      <Icon className="h-3.5 w-3.5 text-white/80" /> {children}
    </h2>
  );
}

function Modal({ modal, onClose }: { modal: NonNullable<Modal>; onClose: () => void }) {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scenario, setScenario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitCommunityPost({
        author,
        title,
        description,
        scenario,
      });
      setSuccess(true);
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("Failed to submit post", err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-white/10 bg-black p-6 shadow-2xl animate-fade-in-up">
        <div className="flex items-start justify-between">
          {modal.kind === "post" ? (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Share your scenario</div>
              <h3 className="mt-1 text-base font-semibold text-white">Post to community</h3>
            </div>
          ) : modal.kind === "creator" ? (
            <div className="flex items-center gap-3">
              <div className={`h-12 w-12 rounded-full bg-white/20 ring-1 ring-white/20`} />
              <div>
                <div className="text-base font-semibold text-white">{modal.data.name}</div>
                <div className="text-xs text-slate-400">{modal.data.handle}</div>
              </div>
            </div>
          ) : modal.kind === "discussion" ? (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Discussion · {modal.data.handle}</div>
              <h3 className="mt-1 text-base font-semibold text-white">{modal.data.who}</h3>
            </div>
          ) : (
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-500">Remix · {modal.data.creator}</div>
              <h3 className="mt-1 text-base font-semibold text-white">{modal.data.title}</h3>
            </div>
          )}
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X className="h-4 w-4" /></button>
        </div>

        {modal.kind === "post" ? (
          success ? (
            <div className="mt-6 text-center">
              <div className="text-4xl"><Sparkles className="h-8 w-8 mx-auto" /></div>
              <p className="mt-3 text-sm text-slate-300">Scenario shared to community!</p>
            </div>
          ) : (
            <form onSubmit={handlePostSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400">Your name</label>
                <input
                  type="text"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  placeholder="Your handle"
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400">Scenario title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What if..."
                  required
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400">Scenario description</label>
                <textarea
                  value={scenario}
                  onChange={(e) => setScenario(e.target.value)}
                  placeholder="Describe the scenario..."
                  required
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10 resize-none"
                />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wider text-slate-400">Additional context</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Why this matters..."
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn-glow rounded-xl px-4 py-2 text-sm disabled:opacity-60">
                  {submitting ? "Sharing..." : "Share scenario"}
                </button>
              </div>
            </form>
          )
        ) : (
          <div className="mt-4 text-sm text-slate-300">
            {modal.kind === "creator" && (
              <>
                <p>{modal.data.bio}</p>
                <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                  <span><b className="text-white">{modal.data.scenarios}</b> scenarios</span>
                  <span><b className="text-white">{Math.floor(modal.data.scenarios * 47)}</b> followers</span>
                </div>
              </>
            )}
            {modal.kind === "discussion" && (
              <>
                <p className="italic text-slate-200">"{modal.data.text}"</p>
                <p className="mt-3 text-slate-400">{modal.data.thread}</p>
              </>
            )}
            {modal.kind === "remix" && (
              <>
                <p>{modal.data.summary}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {modal.data.tags.map((t) => (
                    <span key={t} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-slate-300">{t}</span>
                  ))}
                </div>
                <div className="mt-3 text-xs text-slate-400">{modal.data.likes} remixes</div>
              </>
            )}
          </div>
        )}

        {modal.kind !== "post" && (
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={onClose} className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 hover:bg-white/10">Close</button>
            <Link to="/app/flow" search={{ q: modal.kind === 'remix' ? modal.data.title : 'Community Scenario' }} className="btn-glow rounded-xl px-4 py-2 text-sm">Open simulation</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function DirectPublishForm() {
  const [author, setAuthor] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scenario, setScenario] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitCommunityPost({ author, title, description, scenario });
      setSuccess(true);
      setAuthor(""); setTitle(""); setDescription(""); setScenario("");
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 mb-10 rounded-2xl border border-white/10 bg-black/60 p-6 shadow-lg max-w-2xl mx-auto backdrop-blur-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <input
          type="text"
          value={author}
          onChange={e => setAuthor(e.target.value)}
          placeholder="Your name"
          required
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10"
        />
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Scenario title (What if...)"
          required
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10"
        />
      </div>
      <textarea
        value={scenario}
        onChange={e => setScenario(e.target.value)}
        placeholder="Describe your scenario..."
        required
        rows={2}
        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10 resize-none"
      />
      <input
        type="text"
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Why does this matter? (optional)"
        className="mt-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-slate-500 outline-none focus:border-white/40 focus:bg-white/10"
      />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="btn-glow rounded-xl px-5 py-2 text-sm font-medium disabled:opacity-60"
        >
          {submitting ? "Publishing..." : "Publish scenario"}
        </button>
        {success && <span className="text-emerald-400 text-sm">Published!</span>}
        {error && <span className="text-rose-400 text-sm">{error}</span>}
      </div>
    </form>
  );
}
