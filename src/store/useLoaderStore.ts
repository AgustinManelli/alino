"use client";

import { create } from "zustand";

interface loader_interface {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoaderStore = create<loader_interface>()((set) => ({
  isLoading: false,
  setLoading: (state) => {
    set({ isLoading: state });
  },
}));
