import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useSimulationStore } from "@/lib/store";
import { debate as apiDebate } from "@/lib/api";
import type { Participant, DebateMessage } from "@/lib/types";
import { Loader2, Play, RefreshCw, RotateCcw, Send, Sparkles, Users, CheckCircle2, X } from "lucide-react";

export const Route = createFileRoute("/app/debate")({
  head: () => ({ meta: [{ title: "Debate Mode — iffy.ai" }] }),
  component: DebatePage,
});

// Colour palette for participant avatars
const COLORS = [
  "from-sky-400 to-cyan-300",
  "from-violet-400 to-fuchsia-400",
  "from-emerald-400 to-teal-300",
  "from-amber-400 to-rose-400",
  "from-indigo-400 to-blue-400",
  "from-rose-400 to-pink-400",
  "from-cyan-400 to-blue-500",
  "from-purple-400 to-indigo-500",
  "from-fuchsia-400 to-pink-500",
  "from-orange-400 to-red-500",
];

function getColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

function stanceColor(stance: string) {
  if (stance === "supportive") return "bg-emerald-400/10 text-emerald-300 border-emerald-400/30";
  if (stance === "opposed") return "bg-rose-400/10 text-rose-300 border-rose-400/30";
  if (stance === "conflicted") return "bg-amber-400/10 text-amber-300 border-amber-400/30";
  return "bg-slate-400/10 text-slate-300 border-slate-400/30";
}

function DebatePage() {
  const navigate = useNavigate();
  const {
    simulation, isLoading,
    debateParticipants, debateMessages, isDebateLoading,
    setDebate, appendDebateMessages, setDebateLoading,
  } = useSimulationStore();

  const [participants, setParticipants] = useState<Participant[]>(debateParticipants);
  const [messages, setMessages] = useState<DebateMessage[]>(debateMessages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeParticipants, setActiveParticipants] = useState<Participant[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [debateStarted, setDebateStarted] = useState(messages.length > 0);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Redirect if no simulation
  useEffect(() => {
    if (!simulation && !isLoading) navigate({ to: "/" });
  }, [simulation, isLoading, navigate]);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isDebateLoading]);

  // Sync from store when background fetch finishes
  useEffect(() => {
    if (debateParticipants.length > 0 && participants.length === 0) {
      setParticipants(debateParticipants);
      // Auto-select first two
      setSelectedIds(new Set(debateParticipants.slice(0, 2).map((p) => p.id)));
    }
  }, [debateParticipants]);

  useEffect(() => {
    if (debateMessages.length > 0 && messages.length === 0) {
      setMessages(debateMessages);
      if (!debateStarted) setDebateStarted(true);
    }
  }, [debateMessages]);

  const toggleParticipant = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const startDebate = async () => {
    if (!simulation || selectedIds.size < 2) return;
    const chosen = participants.filter((p) => selectedIds.has(p.id));
    setActiveParticipants(chosen);
    setDebateLoading(true);
    setError(null);
    try {
      const scenario = simulation.metadata?.scenario ?? simulation.title;
      const res = await apiDebate(simulation.simulation_id, chosen, [], scenario, undefined, "messages");
      setDebate(chosen, res.messages);
      setMessages(res.messages);
      setDebateStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start debate");
    } finally {
      setDebateLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || isDebateLoading || !simulation) return;
    setInput("");

    const userMsg: DebateMessage = { speaker_id: "User", message: text, emotion: "neutral", stance_strength: 0.5 };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    setDebateLoading(true);
    setError(null);
    try {
      const scenario = simulation.metadata?.scenario ?? simulation.title;
      const res = await apiDebate(simulation.simulation_id, activeParticipants, newMessages, scenario, undefined, "messages");
      setMessages(res.messages);
      setDebate(activeParticipants, res.messages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue debate");
    } finally {
      setDebateLoading(false);
    }
  };

  const reset = () => {
    setMessages([]);
    setDebate(participants, []);
    setDebateStarted(false);
    setActiveParticipants([]);
    setSelectedIds(new Set());
  };

  if (!simulation) return null;

  const participantMap = Object.fromEntries(
    [...participants, ...activeParticipants].map((p) => [p.id, p])
  );

  // ── Selection Phase ───────────────────────────────────────────────────────
  if (!debateStarted) {
    return (
      <div className="mx-auto max-w-[900px] px-4 py-12 sm:px-6">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Assemble the Panel</h2>
          <p className="text-slate-400 max-w-md mx-auto">
            Select two or more stakeholders to participate in a simulated debate about the scenario.
          </p>
        </div>

        {isDebateLoading && participants.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-12">
            <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
            <span className="text-sm text-slate-500">Identifying key stakeholders…</span>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {participants.map((p) => {
              const selected = selectedIds.has(p.id);
              const color = getColor(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => toggleParticipant(p.id)}
                  className={`relative flex flex-col items-center gap-1.5 px-4 py-3 rounded-2xl border transition-all cursor-pointer min-w-[100px] ${
                    selected ? "bg-blue-600/20 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.15)]" : "bg-white/3 border-white/10 hover:bg-white/7"
                  }`}
                >
                  {selected && (
                    <div className="absolute -top-2 -right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} ring-1 ring-white/20 flex items-center justify-center text-sm font-bold text-slate-900`}>
                    {p.name.charAt(0)}
                  </div>
                  <span className="text-xs font-semibold text-slate-200">{p.name}</span>
                  <span className="text-[10px] text-slate-500">{p.role}</span>
                  <span className={`text-[9px] px-2 py-0.5 rounded-full border font-medium ${stanceColor(p.stance)}`}>
                    {p.stance}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {participants.length > 0 && (
          <div className="text-center">
            <button
              onClick={startDebate}
              disabled={selectedIds.size < 2 || isDebateLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDebateLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isDebateLoading ? "Starting Debate…" : `Start Debate (${selectedIds.size} selected)`}
            </button>
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-rose-400/30 bg-rose-400/10 p-3 text-xs text-rose-200 text-center">
            {error}
          </div>
        )}
      </div>
    );
  }

  // ── Debate Phase ──────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-[900px] px-4 py-4 sm:px-6 flex flex-col" style={{ height: "calc(100vh - 120px)" }}>
      {/* Active participants */}
      <div className="shrink-0 px-1 py-2 mb-3 border-b border-white/6">
        <div className="flex gap-2 flex-wrap">
          {activeParticipants.map((p) => {
            const color = getColor(p.id);
            return (
              <div key={p.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs">
                <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${color} ring-1 ring-white/20 flex items-center justify-center text-[9px] font-bold text-slate-900`}>
                  {p.name.charAt(0)}
                </div>
                <span className="text-slate-200">{p.name}</span>
                <span className="text-slate-500">· {p.role}</span>
              </div>
            );
          })}
          <button onClick={reset} className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-rose-400/20 bg-rose-400/5 text-xs text-rose-300 hover:bg-rose-400/10">
            <RotateCcw className="h-3 w-3" /> Reset
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
        {messages.map((msg, i) => {
          const isUser = msg.speaker_id === "User";
          const p = participantMap[msg.speaker_id];
          const color = isUser ? "from-sky-500 to-violet-500" : getColor(msg.speaker_id);
          return (
            <div key={i} className={`flex items-start gap-3 animate-fade-in-up ${isUser ? "flex-row-reverse" : ""}`}>
              <div className={`relative w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${color} ring-1 ring-white/20 mt-0.5`}>
                <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-slate-900">
                  {isUser ? "U" : p?.name?.charAt(0) ?? "?"}
                </span>
              </div>
              <div className={`max-w-[75%] flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                {!isUser && (
                  <div className="mb-1 flex items-center gap-2 text-[11px]">
                    <span className="font-medium text-white">{p?.name ?? msg.speaker_id}</span>
                    <span className="text-slate-500">{p?.role}</span>
                  </div>
                )}
                <div className={`rounded-2xl px-4 py-2.5 text-sm text-slate-200 border ${
                  isUser
                    ? "rounded-tr-md bg-gradient-to-br from-sky-500/20 to-violet-500/20 border-white/10"
                    : "rounded-tl-md bg-white/[0.03] border-white/8"
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          );
        })}
        {isDebateLoading && (
          <div className="flex items-center gap-2 pl-11 text-xs text-slate-400">
            <span className="inline-flex gap-1">
              {[0, 120, 240].map((delay) => (
                <span key={delay} className="h-1.5 w-1.5 animate-bounce rounded-full bg-sky-300" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </span>
            <span>Generating responses…</span>
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
            {error}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 pt-3 border-t border-white/6">
        <form onSubmit={sendMessage} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-[#080d1c]/80 px-4 py-2.5">
          <Sparkles className="h-4 w-4 text-sky-300 shrink-0" />
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isDebateLoading}
            placeholder="Join the debate or steer the conversation…"
            className="flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          <button type="submit" disabled={isDebateLoading || !input.trim()} className="btn-glow inline-flex h-9 w-9 items-center justify-center rounded-xl disabled:opacity-50 shrink-0">
            {isDebateLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 ml-px" />}
          </button>
        </form>
      </div>
    </div>
  );
}
