"use client";

import { create } from "zustand";

interface loader_interface {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoaderStore = create<loader_interface>()((set) => ({
  isLoading: false,
  // setLoading: (loading) => set({ isLoading: loading }),
  setLoading: (state) => {
    if (typeof window !== "undefined") {
      document.body.style.overflow = state ? "hidden" : "auto";
    }
    set({ isLoading: state });
  },
}));
