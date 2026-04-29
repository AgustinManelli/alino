"use client";

import { useStreakStore } from "@/store/useStreakStore";

export type StreakData = {
  current_streak: number;
  max_streak: number;
  last_completion_date: string | null;
  free_protectors_used: number;
  free_protectors_limit: number;
  purchased_protectors: number;
  is_active_today: boolean;
};

export function useStreak() {
  const { streak, isLoading, fetchStreak } = useStreakStore();

  return {
    streak,
    isLoading,
    fetchStreak,
  };
}
