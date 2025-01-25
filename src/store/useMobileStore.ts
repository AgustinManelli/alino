"use client";

import { create } from "zustand";

interface MobileState {
  isMobile: boolean;
  setIsMobile: (value: boolean) => void;
}

export const useMobileStore = create<MobileState>((set) => ({
  isMobile: false,
  setIsMobile: (value) => set({ isMobile: value }),
}));

export default useMobileStore;
