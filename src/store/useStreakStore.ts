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
    // Enviamos la zona horaria actual al backend.
    // El backend se encargará de guardarla si es necesario.
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const { data } = await getStreakData(timezone);
    if (data) {
      set({ streak: data });
    }
    set({ isLoading: false });
  },
  setStreak: (data) => set({ streak: data }),
}));
