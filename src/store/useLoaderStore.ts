"use client";

import { create } from "zustand";

interface LoaderState {
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useLoaderStore = create<LoaderState>((set) => ({
  loading: false,
  setLoading: (loading) => set({ loading }),
}));
