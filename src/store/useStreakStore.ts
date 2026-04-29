"use client";

import { create } from "zustand";
import { getStreakData } from "@/lib/api/dashboard/actions";
import { StreakData } from "@/hooks/dashboard/useStreak";

interface StreakStore {
  streak: StreakData | null;
  isLoading: boolean;
  fetchStreak: () => Promise<void>;
  setStreak: (data: StreakData) => void;
}

export const useStreakStore = create<StreakStore>((set) => ({
  streak: null,
  isLoading: false,
  fetchStreak: async () => {
    set({ isLoading: true });
    const { data } = await getStreakData();
    if (data) {
      set({ streak: data });
    }
    set({ isLoading: false });
  },
  setStreak: (data) => set({ streak: data }),
}));
