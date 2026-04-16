"use client";

import { create } from "zustand";

interface SyncState {
  loadingQueue: number;
  addLoading: () => void;
  removeLoading: () => void;
  resetLoading: () => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  loadingQueue: 0,
  addLoading: () => set((state) => ({ loadingQueue: state.loadingQueue + 1 })),
  removeLoading: () =>
    set((state) => ({ loadingQueue: Math.max(0, state.loadingQueue - 1) })),
  resetLoading: () => set({ loadingQueue: 0 }),
}));
