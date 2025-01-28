"use client";

//store para almacenar info de la plataforma que está utilizando el usuario

import { create } from "zustand";

interface PlatformInfo {
  isMobile: boolean;
  isStandalone: boolean;
  setIsMobile: (value: boolean) => void;
}

export const usePlatformInfoStore = create<PlatformInfo>((set) => ({
  isMobile: window.innerWidth < 850,
  isStandalone:
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches,
  setIsMobile: (value) => set({ isMobile: value }),
}));
