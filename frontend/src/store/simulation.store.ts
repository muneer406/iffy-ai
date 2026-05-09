"use client";
import { create } from "zustand";
import type { SimulationResponse, SimulationNode, SimulationEdge, SectorImpact, MutationResponse } from "@/types/simulation";
import { useHistoryStore } from "./history.store";

interface SimulationStore {
  simulationId: string | null;
  simulation: SimulationResponse | null;
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  debateMessages: any[];
  selectedDuration: "immediate" | "short_term" | "long_term";
  isLoading: boolean;
  error: string | null;

  setSimulation: (sim: SimulationResponse) => void;
  applyMutation: (mutation: MutationResponse) => void;
  addSectorImpact: (impact: SectorImpact) => void;
  updateDebate: (participants: any[], messages: any[]) => void;
  setDuration: (d: "immediate" | "short_term" | "long_term") => void;
  setLoading: (loading: boolean) => void;
  setError: (err: string | null) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationStore>((set) => ({
  simulationId: null,
  simulation: null,
  nodes: [],
  edges: [],
  debateMessages: [],
  selectedDuration: "immediate",
  isLoading: false,
  error: null,

  setSimulation: (sim) => {
    set({
      simulationId: sim.simulation_id,
      simulation: sim,
      nodes: sim.nodes,
      edges: sim.edges,
      error: null,
    });
    useHistoryStore.getState().addSimulation(sim);
  },

  applyMutation: (mutation) => {
    set((state) => {
      const newSim = state.simulation ? {
        ...state.simulation,
        nodes: mutation.updated_nodes,
        edges: mutation.updated_edges,
        timeline: mutation.updated_timeline,
        sector_impacts: mutation.updated_sector_impacts,
      } : null;
      
      if (newSim) useHistoryStore.getState().addSimulation(newSim);

      return {
        nodes: mutation.updated_nodes,
        edges: mutation.updated_edges,
        simulation: newSim,
      };
    });
  },

  addSectorImpact: (impact) => {
    set((state) => {
      if (!state.simulation) return {};
      const existing = state.simulation.sector_impacts?.filter(s => s.sector !== impact.sector) || [];
      const newSim = {
        ...state.simulation,
        sector_impacts: [...existing, impact],
      };
      useHistoryStore.getState().addSimulation(newSim);
      return { simulation: newSim };
    });
  },

  updateDebate: (participants, messages) => {
    set((state) => {
      if (!state.simulation) return {};
      const newSim = {
        ...state.simulation,
        debate_participants: participants,
      };
      useHistoryStore.getState().addSimulation(newSim);
      return {
        debateMessages: messages,
        simulation: newSim
      };
    });
  },

  setDuration: (d) => set({ selectedDuration: d }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  reset: () =>
    set({
      simulationId: null,
      simulation: null,
      nodes: [],
      edges: [],
      debateMessages: [],
      isLoading: false,
      error: null,
    }),
}));
