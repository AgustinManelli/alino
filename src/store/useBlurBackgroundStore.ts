"use client";

import { create } from "zustand";

interface blur_interface {
  color: string | undefined;
  setColor: (color: string) => void;
}

export const useBlurBackgroundStore = create<blur_interface>((set) => ({
  color: "transparent",
  setColor: (color) => set({ color }),
}));
