"use client";

import { create } from "zustand";

interface platform_interface {
  isMobile: boolean | null;
  isStandalone: boolean;
  setIsMobile: (value: boolean) => void;
}

export const usePlatformInfoStore = create<platform_interface>((set) => ({
  isMobile: null,
  isStandalone:
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches,
  setIsMobile: (value) => set({ isMobile: value }),
}));
