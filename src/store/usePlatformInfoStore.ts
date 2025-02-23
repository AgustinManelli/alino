"use client";

//store para almacenar info de la plataforma que está utilizando el usuario

import { create } from "zustand";

interface platform_interface {
  isMobile: boolean;
  isStandalone: boolean;
  setIsMobile: (value: boolean) => void;
}

export const usePlatformInfoStore = create<platform_interface>((set) => ({
  isMobile: false,
  isStandalone:
    typeof window !== "undefined" &&
    window.matchMedia("(display-mode: standalone)").matches,
  setIsMobile: (value) => set({ isMobile: value }),
}));
