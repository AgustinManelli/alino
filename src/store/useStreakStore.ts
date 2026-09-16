"use client";

import { create } from "zustand";
import { getStreakData } from "@/lib/api/dashboard/actions";
import { StreakData } from "@/hooks/dashboard/useStreak";

interface StreakStore {
  streak: StreakData | null;
  isLoading: boolean;
  fetchStreak: (force?: boolean) => Promise<void>;
  setStreak: (data: StreakData) => void;
}

let activeFetchPromise: Promise<void> | null = null;
let lastFetchedTimestamp = 0;
const CACHE_TTL_MS = 30000;

export const useStreakStore = create<StreakStore>((set) => ({
  streak: null,
  isLoading: false,
  fetchStreak: async (force = false) => {
    const now = Date.now();
    if (!force && activeFetchPromise) {
      return activeFetchPromise;
    }
    if (!force && now - lastFetchedTimestamp < CACHE_TTL_MS) {
      return;
    }

    set({ isLoading: true });
    activeFetchPromise = (async () => {
      try {
        const timezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone ||
          "America/Argentina/Buenos_Aires";
        const { data } = await getStreakData(timezone);
        if (data) {
          set({ streak: data });
          lastFetchedTimestamp = Date.now();
        }
      } finally {
        set({ isLoading: false });
        activeFetchPromise = null;
      }
    })();

    return activeFetchPromise;
  },
  setStreak: (data) => set({ streak: data }),
}));
