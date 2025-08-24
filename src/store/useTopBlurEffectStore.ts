"use client";

import { create } from "zustand";

interface BlurInterface {
  color: string | undefined;
  setColor: (color: string) => void;
}

export const useTopBlurEffectStore = create<BlurInterface>((set) => ({
  color: "transparent",
  setColor: (color) => set({ color }),
}));
