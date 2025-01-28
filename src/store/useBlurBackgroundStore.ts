"use client";

import { create } from "zustand";

interface BlurredState {
  color: string | undefined;
  setColor: (color: string) => void;
}

export const useBlurBackgroundStore = create<BlurredState>((set) => ({
  color: "transparent",
  setColor: (color) => set({ color }),
}));
