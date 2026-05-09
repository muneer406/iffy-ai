import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimulationResponse } from "@/types/simulation";

export interface HistoryItem {
  simulation_id: string;
  title: string;
  scenario: string;
  summary: string;
  timestamp: number;
  data: SimulationResponse;
}

interface HistoryStore {
  history: HistoryItem[];
  addSimulation: (sim: SimulationResponse) => void;
  removeSimulation: (id: string) => void;
  clearHistory: () => void;
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addSimulation: (sim) =>
        set((state) => {
          // Remove if already exists (to move to top)
          const filtered = state.history.filter((h) => h.simulation_id !== sim.simulation_id);
          
          const newItem: HistoryItem = {
            simulation_id: sim.simulation_id,
            title: sim.title,
            scenario: sim.metadata?.scenario || sim.title,
            summary: sim.summary,
            timestamp: Date.now(),
            data: sim,
          };
          
          // Keep max 10 to avoid local storage quota issues
          return { history: [newItem, ...filtered].slice(0, 10) };
        }),
      removeSimulation: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.simulation_id !== id),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    {
      name: "iffy-simulation-history",
    }
  )
);
