"use client";
import { create } from "zustand";
import type { TabKey } from "@/types/simulation";

interface UIStore {
  activeTab: TabKey;
  selectedSector: string | null;
  isMutating: boolean;
  isDebateLoading: boolean;
  isSectorLoading: boolean;
  hoveredNodeId: string | null;

  setTab: (tab: TabKey) => void;
  setSector: (sector: string | null) => void;
  setMutating: (v: boolean) => void;
  setDebateLoading: (v: boolean) => void;
  setSectorLoading: (v: boolean) => void;
  setHoveredNode: (id: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  activeTab: "flowchart",
  selectedSector: null,
  isMutating: false,
  isDebateLoading: false,
  isSectorLoading: false,
  hoveredNodeId: null,

  setTab: (tab) => set({ activeTab: tab }),
  setSector: (sector) => set({ selectedSector: sector }),
  setMutating: (v) => set({ isMutating: v }),
  setDebateLoading: (v) => set({ isDebateLoading: v }),
  setSectorLoading: (v) => set({ isSectorLoading: v }),
  setHoveredNode: (id) => set({ hoveredNodeId: id }),
}));
