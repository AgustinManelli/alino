"use client";

import { create } from "zustand";

interface UIState {
  // Loader
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Top Blur
  isTopBlurVisible: boolean;
  setTopBlurVisible: (visible: boolean) => void;
  color: string;
  setColor: (color: string) => void;

  // Outside Click
  ignoreRefs: React.RefObject<HTMLElement>[];
  registerRef: (ref: React.RefObject<HTMLElement>) => void;
  unregisterRef: (ref: React.RefObject<HTMLElement>) => void;

  // Portals
  activePortals: string[];
  addPortal: (id: string) => void;
  removePortal: (id: string) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  setLoading: (loading) => set({ isLoading: loading }),

  isTopBlurVisible: false,
  setTopBlurVisible: (visible) => set({ isTopBlurVisible: visible }),

  color: "",
  setColor: (color) => set({ color }),

  ignoreRefs: [],
  registerRef: (ref) =>
    set((state) => ({
      ignoreRefs: [...state.ignoreRefs, ref],
    })),
  unregisterRef: (ref) =>
    set((state) => ({
      ignoreRefs: state.ignoreRefs.filter((r) => r !== ref),
    })),

  activePortals: [],
  addPortal: (id) =>
    set((state) => ({ activePortals: [...state.activePortals, id] })),
  removePortal: (id) =>
    set((state) => ({
      activePortals: state.activePortals.filter((p) => p !== id),
    })),
}));
