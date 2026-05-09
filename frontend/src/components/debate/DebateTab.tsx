"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, RefreshCw } from "lucide-react";
import { cn, getParticipantColor, getStanceColor, capitalize } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation.store";
import { useUIStore } from "@/store/ui.store";
import { debate as apiDebate } from "@/lib/api/client";
import type { Participant, DebateMessage } from "@/types/simulation";

// ─── Participant card ─────────────────────────────────────────────────────────
function ParticipantCard({ p }: { p: Participant }) {
  const color = getParticipantColor(p.id);
  return (
    <div className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border border-white/8 bg-white/2 min-w-[88px]">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
        style={{ background: `${color}30`, border: `2px solid ${color}60` }}
      >
        {p.name.charAt(0)}
      </div>
      <span className="text-xs font-semibold text-slate-200">{p.name}</span>
      <span className="text-[10px] text-slate-500">{p.role}</span>
      <span className={cn("text-[9px] px-2 py-0.5 rounded-full border font-medium", getStanceColor(p.stance))}>
        {capitalize(p.stance)}
      </span>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, participant }: { msg: DebateMessage; participant?: Participant }) {
  const color = participant ? getParticipantColor(participant.id) : "#64748b";
  const emotionEmoji: Record<string, string> = {
    excited: "🔥", concerned: "😟", angry: "😤", hopeful: "🌟",
    skeptical: "🤨", neutral: "💭", passionate: "❤️", resigned: "😔",
  };

  return (
    <motion.div
      className="flex items-start gap-3"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
        style={{ background: `${color}30`, border: `1.5px solid ${color}60` }}
      >
        {participant?.name?.charAt(0) ?? "?"}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-300">{participant?.name ?? msg.speaker_id}</span>
          <span className="text-[10px] text-slate-600">{participant?.role}</span>
          <span className="text-[11px] ml-auto">{emotionEmoji[msg.emotion] ?? "💭"}</span>
        </div>

        {/* Message */}
        <div
          className="px-3.5 py-2.5 rounded-xl rounded-tl-sm text-sm text-slate-200 leading-relaxed border"
          style={{
            background: `${color}0a`,
            borderColor: `${color}25`,
          }}
        >
          {msg.message}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10" />
      <div className="flex items-center gap-1 px-3.5 py-2.5 rounded-xl bg-white/3 border border-white/8">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-slate-400"
            animate={{ y: [-3, 0, -3] }}
            transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main DebateTab ───────────────────────────────────────────────────────────
export function DebateTab() {
  const { simulation } = useSimulationStore();
  const { isDebateLoading, setDebateLoading } = useUIStore();

  const [participants, setParticipants] = useState<Participant[]>(
    simulation?.debate_participants ?? []
  );
  const [messages, setMessages] = useState<DebateMessage[]>(useSimulationStore.getState().debateMessages || []);
  const [initialized, setInitialized] = useState(false);
  const [continuation, setContinuation] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isDebateLoading]);

  // Sync with store if background load finishes
  useEffect(() => {
    if (simulation?.debate_participants?.length) {
      setParticipants(simulation.debate_participants);
    }
  }, [simulation?.debate_participants]);

  useEffect(() => {
    const storeMessages = useSimulationStore.getState().debateMessages;
    if (storeMessages?.length) {
      setMessages(storeMessages);
    }
  }, [useSimulationStore.getState().debateMessages]);

  // We don't need to generateDebate on load anymore if page.tsx handles it.
  // But just in case, if not loading and empty:
  useEffect(() => {
    if (!simulation || initialized || isDebateLoading || messages.length > 0) return;
    generateDebate();
    setInitialized(true);
  }, [simulation, isDebateLoading, messages.length]);

  const participantMap = Object.fromEntries(participants.map((p) => [p.id, p]));

  const generateDebate = async (cont?: string) => {
    if (!simulation) return;
    setDebateLoading(true);
    try {
      const res = await apiDebate(
        simulation.simulation_id,
        participants,
        messages,
        simulation.metadata?.scenario ?? simulation.title,
        cont
      );
      setParticipants(res.participants);
      setMessages(res.messages);
    } catch (err) {
      console.error("Debate failed:", err);
    } finally {
      setDebateLoading(false);
    }
  };

  const handleContinue = () => {
    const cont = continuation.trim() || undefined;
    setContinuation("");
    generateDebate(cont);
  };

  if (!simulation) return null;

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {/* Participants row */}
      <div className="px-4 py-3 border-b border-white/6 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-500 uppercase tracking-widest font-medium">Participants</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {participants.map((p) => <ParticipantCard key={p.id} p={p} />)}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        <AnimatePresence>
          {messages.length === 0 && !isDebateLoading && (
            <motion.div
              className="flex items-center justify-center h-32"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            >
              <span className="text-sm text-slate-600">Starting debate…</span>
            </motion.div>
          )}
          {messages.map((msg, i) => (
            <MessageBubble
              key={`${msg.speaker_id}-${i}`}
              msg={msg}
              participant={participantMap[msg.speaker_id]}
            />
          ))}
          {isDebateLoading && <TypingIndicator />}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Continue input */}
      <div className="px-4 py-3 border-t border-white/6 shrink-0">
        <div className="flex gap-2">
          <input
            value={continuation}
            onChange={(e) => setContinuation(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !isDebateLoading && handleContinue()}
            disabled={isDebateLoading}
            placeholder="Add a focus for the next round… (or leave blank)"
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/3 border border-white/8 text-sm text-white placeholder-slate-600 outline-none focus:border-blue-500/40 disabled:opacity-50 transition-colors"
          />
          <button
            onClick={handleContinue}
            disabled={isDebateLoading}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600/80 hover:bg-blue-500 text-white text-sm font-medium disabled:opacity-50 transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            {isDebateLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>Continue <Send className="w-3.5 h-3.5" /></>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
