"use client";
import { create } from "zustand";
import type { SimulationResponse, SimulationNode, SimulationEdge, SectorImpact, MutationResponse } from "@/types/simulation";

interface SimulationStore {
  simulationId: string | null;
  simulation: SimulationResponse | null;
  nodes: SimulationNode[];
  edges: SimulationEdge[];
  selectedDuration: "immediate" | "short_term" | "long_term";
  isLoading: boolean;
  error: string | null;

  setSimulation: (sim: SimulationResponse) => void;
  applyMutation: (mutation: MutationResponse) => void;
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
  selectedDuration: "long_term",
  isLoading: false,
  error: null,

  setSimulation: (sim) =>
    set({
      simulationId: sim.simulation_id,
      simulation: sim,
      nodes: sim.nodes,
      edges: sim.edges,
      error: null,
    }),

  applyMutation: (mutation) =>
    set((state) => ({
      nodes: mutation.updated_nodes,
      edges: mutation.updated_edges,
      simulation: state.simulation
        ? {
            ...state.simulation,
            nodes: mutation.updated_nodes,
            edges: mutation.updated_edges,
            timeline: mutation.updated_timeline,
            sector_impacts: mutation.updated_sector_impacts,
          }
        : null,
    })),

  setDuration: (d) => set({ selectedDuration: d }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (err) => set({ error: err }),
  reset: () =>
    set({
      simulationId: null,
      simulation: null,
      nodes: [],
      edges: [],
      isLoading: false,
      error: null,
    }),
}));
