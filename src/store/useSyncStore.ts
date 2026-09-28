"use client";

import { create } from "zustand";

interface SyncState {
  loadingQueue: number;
  isOnline: boolean;
  pendingSyncCount: number;
  addLoading: () => void;
  removeLoading: () => void;
  resetLoading: () => void;
  setIsOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
  loadingQueue: 0,
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  pendingSyncCount: 0,
  addLoading: () => set((state) => ({ loadingQueue: state.loadingQueue + 1 })),
  removeLoading: () =>
    set((state) => ({ loadingQueue: Math.max(0, state.loadingQueue - 1) })),
  resetLoading: () => set({ loadingQueue: 0 }),
  setIsOnline: (isOnline) => set({ isOnline }),
  setPendingSyncCount: (pendingSyncCount) => set({ pendingSyncCount }),
}));
