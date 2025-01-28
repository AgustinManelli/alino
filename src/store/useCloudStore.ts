"use client";

import { create } from "zustand";

interface Cloud {
  state: boolean;
  queue: number;
  setState: (state: boolean) => void;
  addToQueue: (value: number) => void;
}

export const useCloudStore = create<Cloud>((set) => ({
  state: false,
  queue: 0,
  setState: (state) => set({ state }),
  addToQueue: (value: number) =>
    set((state) => ({ queue: state.queue + value })),
}));
