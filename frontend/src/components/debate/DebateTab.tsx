"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Users, RefreshCw, CheckCircle2, Play } from "lucide-react";
import { cn, getParticipantColor, getStanceColor, capitalize } from "@/lib/utils";
import { useSimulationStore } from "@/store/simulation.store";
import { useUIStore } from "@/store/ui.store";
import { debate as apiDebate } from "@/lib/api/client";
import type { Participant, DebateMessage } from "@/types/simulation";

// ─── Participant card ─────────────────────────────────────────────────────────
function ParticipantCard({ p, selected, onClick }: { p: Participant; selected?: boolean; onClick?: () => void }) {
  const color = getParticipantColor(p.id);
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-xl border min-w-[88px] relative transition-all",
        onClick ? "cursor-pointer hover:bg-white/5" : "",
        selected
          ? "bg-blue-600/20 border-blue-500/50"
          : "bg-white/2 border-white/8"
      )}
    >
      {selected && (
        <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-white" />
        </div>
      )}
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
  const isUser = msg.speaker_id === "User";
  const color = isUser ? "#3b82f6" : participant ? getParticipantColor(participant.id) : "#64748b";
  
  return (
    <motion.div
      className={cn("flex items-start gap-3", isUser ? "flex-row-reverse" : "")}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
        style={{ background: `${color}30`, border: `1.5px solid ${color}60` }}
      >
        {isUser ? "U" : participant?.name?.charAt(0) ?? "?"}
      </div>

      <div className={cn("flex-1 min-w-0 flex flex-col", isUser ? "items-end" : "items-start")}>
        {/* Header */}
        <div className={cn("flex items-center gap-2 mb-1", isUser ? "flex-row-reverse" : "")}>
          <span className="text-xs font-semibold text-slate-300">{isUser ? "You" : (participant?.name ?? msg.speaker_id)}</span>
          {!isUser && <span className="text-[10px] text-slate-600">{participant?.role}</span>}
        </div>

        {/* Message */}
        <div
          className={cn(
            "px-3.5 py-2.5 rounded-xl text-sm text-slate-200 leading-relaxed border",
            isUser ? "rounded-tr-sm" : "rounded-tl-sm"
          )}
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
  const { simulation, updateDebate } = useSimulationStore();
  const { isDebateLoading, setDebateLoading } = useUIStore();

  const [participants, setParticipants] = useState<Participant[]>(
    simulation?.debate_participants ?? []
  );
  const [messages, setMessages] = useState<DebateMessage[]>(useSimulationStore.getState().debateMessages || []);
  const [selectedParticipants, setSelectedParticipants] = useState<Set<string>>(new Set());
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
      if (selectedParticipants.size === 0) {
        // Auto-select first two if none selected yet
        setSelectedParticipants(new Set(simulation.debate_participants.slice(0, 2).map((p: any) => p.id)));
      }
    }
  }, [simulation?.debate_participants]);

  useEffect(() => {
    const storeMessages = useSimulationStore.getState().debateMessages;
    if (storeMessages?.length) {
      setMessages(storeMessages);
    }
  }, [useSimulationStore.getState().debateMessages]);

  const participantMap = Object.fromEntries(participants.map((p) => [p.id, p]));
  const activeParticipants = participants.filter(p => selectedParticipants.has(p.id));

  const toggleParticipant = (id: string) => {
    const newSet = new Set(selectedParticipants);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedParticipants(newSet);
  };

  const startDebate = async () => {
    if (!simulation || selectedParticipants.size < 2) return;
    setDebateLoading(true);
    try {
      const res = await apiDebate(
        simulation.simulation_id,
        activeParticipants,
        [],
        simulation.metadata?.scenario ?? simulation.title,
        undefined,
        "messages"
      );
      // We pass the full participants list back to updateDebate so we don't lose the inactive ones?
      // Actually we should only keep the active ones for the debate.
      updateDebate(activeParticipants, res.messages);
      setMessages(res.messages);
    } catch (err) {
      console.error("Debate failed:", err);
    } finally {
      setDebateLoading(false);
    }
  };

  const handleContinue = async () => {
    if (!simulation) return;
    const text = continuation.trim();
    if (!text) return;
    
    setContinuation("");
    
    // Optimistically add user message
    const userMsg: DebateMessage = {
      speaker_id: "User",
      message: text,
      emotion: "neutral",
      stance_strength: 0.5
    };
    
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setDebateLoading(true);
    
    try {
      const res = await apiDebate(
        simulation.simulation_id,
        activeParticipants, // only use the ones involved in the debate
        newMessages,
        simulation.metadata?.scenario ?? simulation.title,
        undefined,
        "messages"
      );
      updateDebate(activeParticipants, res.messages);
      setMessages(res.messages);
    } catch (err) {
      console.error("Debate continuation failed:", err);
    } finally {
      setDebateLoading(false);
    }
  };

  if (!simulation) return null;

  const isSelectionPhase = messages.length === 0;

  return (
    <motion.div
      className="flex flex-col h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {isSelectionPhase ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
            <Users className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>Assemble the Panel</h2>
          <p className="text-slate-400 max-w-md mb-8">
            Select two or more stakeholders to participate in a simulated debate about the scenario.
          </p>
          
          {isDebateLoading && participants.length === 0 ? (
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="w-6 h-6 text-blue-400 animate-spin" />
              <span className="text-sm text-slate-500">Identifying key stakeholders...</span>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4 max-w-3xl mb-8">
              {participants.map((p) => (
                <ParticipantCard 
                  key={p.id} 
                  p={p} 
                  selected={selectedParticipants.has(p.id)} 
                  onClick={() => toggleParticipant(p.id)}
                />
              ))}
            </div>
          )}

          {participants.length > 0 && (
            <button
              onClick={startDebate}
              disabled={selectedParticipants.size < 2 || isDebateLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDebateLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
              {isDebateLoading ? "Starting Debate..." : "Start Debate"}
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Active Participants row */}
          <div className="px-4 py-3 border-b border-white/6 shrink-0 bg-[#09090f]/80 backdrop-blur-xl">
            <div className="flex gap-2 overflow-x-auto pb-1">
              {activeParticipants.map((p) => <ParticipantCard key={p.id} p={p} />)}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
            <AnimatePresence>
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
          <div className="p-4 border-t border-white/6 shrink-0 bg-[#0f0f1a]">
            <div className="flex gap-2">
              <input
                value={continuation}
                onChange={(e) => setContinuation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !isDebateLoading && handleContinue()}
                disabled={isDebateLoading}
                placeholder="Join the debate or steer the conversation..."
                className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 outline-none focus:border-blue-500/50 disabled:opacity-50 transition-colors shadow-inner"
              />
              <button
                onClick={handleContinue}
                disabled={isDebateLoading || !continuation.trim()}
                className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDebateLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
