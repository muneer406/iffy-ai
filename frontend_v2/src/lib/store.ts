import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  SimulationResponse,
  SectorImpact,
  MutationResponse,
  Participant,
  DebateMessage,
} from "./types";

// ─── History ─────────────────────────────────────────────────────────────────
export interface HistoryItem {
  simulation_id: string;
  title: string;
  scenario: string;
  timestamp: number;
  data: SimulationResponse;
}

// ─── Main Simulation Store ────────────────────────────────────────────────────
interface SimulationStore {
  // Core data
  simulationId: string | null;
  simulation: SimulationResponse | null;
  isLoading: boolean;
  error: string | null;

  // UI state
  selectedDuration: "immediate" | "short_term" | "long_term";
  isSectorLoading: boolean;
  isDebateLoading: boolean;

  // Debate state
  debateParticipants: Participant[];
  debateMessages: DebateMessage[];

  // History (persisted)
  history: HistoryItem[];

  // Actions
  setSimulation: (sim: SimulationResponse) => void;
  applyMutation: (mutation: MutationResponse) => void;
  addSectorImpact: (impact: SectorImpact) => void;
  setDebate: (participants: Participant[], messages: DebateMessage[]) => void;
  appendDebateMessages: (messages: DebateMessage[]) => void;
  setDuration: (d: "immediate" | "short_term" | "long_term") => void;
  setLoading: (v: boolean) => void;
  setSectorLoading: (v: boolean) => void;
  setDebateLoading: (v: boolean) => void;
  setError: (err: string | null) => void;
  loadFromHistory: (item: HistoryItem) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStore>()(
  persist(
    (set) => ({
      simulationId: null,
      simulation: null,
      isLoading: false,
      error: null,
      selectedDuration: "immediate",
      isSectorLoading: false,
      isDebateLoading: false,
      debateParticipants: [],
      debateMessages: [],
      history: [],

      setSimulation: (sim) =>
        set((state) => {
          // Update history: move to front, keep max 10
          const filtered = state.history.filter(
            (h) => h.simulation_id !== sim.simulation_id
          );
          const item: HistoryItem = {
            simulation_id: sim.simulation_id,
            title: sim.title,
            scenario: sim.metadata?.scenario ?? sim.title,
            timestamp: Date.now(),
            data: sim,
          };
          return {
            simulationId: sim.simulation_id,
            simulation: sim,
            error: null,
            debateParticipants: sim.debate_participants ?? [],
            debateMessages: [],
            history: [item, ...filtered].slice(0, 10),
          };
        }),

      applyMutation: (mutation) =>
        set((state) => {
          if (!state.simulation) return {};
          const newSim: SimulationResponse = {
            ...state.simulation,
            title: mutation.updated_title || state.simulation.title,
            summary: mutation.updated_summary || state.simulation.summary,
            nodes: mutation.updated_nodes,
            edges: mutation.updated_edges,
            timeline: mutation.updated_timeline,
            sector_impacts: mutation.updated_sector_impacts,
          };
          // Update history entry too
          const history = state.history.map((h) =>
            h.simulation_id === newSim.simulation_id
              ? { ...h, title: newSim.title, data: newSim }
              : h
          );
          return { simulation: newSim, history };
        }),

      addSectorImpact: (impact) =>
        set((state) => {
          if (!state.simulation) return {};
          const existing = (state.simulation.sector_impacts ?? []).filter(
            (s) => s.sector !== impact.sector
          );
          const newSim = {
            ...state.simulation,
            sector_impacts: [...existing, impact],
          };
          return { simulation: newSim };
        }),

      setDebate: (participants, messages) =>
        set({ debateParticipants: participants, debateMessages: messages }),

      appendDebateMessages: (newMsgs) =>
        set((state) => ({
          debateMessages: [...state.debateMessages, ...newMsgs],
        })),

      setDuration: (d) => set({ selectedDuration: d }),
      setLoading: (v) => set({ isLoading: v }),
      setSectorLoading: (v) => set({ isSectorLoading: v }),
      setDebateLoading: (v) => set({ isDebateLoading: v }),
      setError: (err) => set({ error: err }),

      loadFromHistory: (item) =>
        set({
          simulationId: item.simulation_id,
          simulation: item.data,
          debateParticipants: item.data.debate_participants ?? [],
          debateMessages: [],
          error: null,
        }),

      reset: () =>
        set({
          simulationId: null,
          simulation: null,
          isLoading: false,
          error: null,
          debateParticipants: [],
          debateMessages: [],
        }),
    }),
    {
      name: "iffy-simulation-store",
      // Only persist history and current simulationId; keep UI state ephemeral
      partialize: (state) => ({
        history: state.history,
        simulationId: state.simulationId,
        simulation: state.simulation,
      }),
    }
  )
);
