"use client";

import { useStreakStore } from "@/store/useStreakStore";

export type DayHistory = {
  date: string;
  event_type:
    | "started"
    | "extended"
    | "protected_free"
    | "protected_purchased"
    | "protected_mixed"
    | "lost"
    | "missed"
    | "today";
  streak_after: number | null;
  free_protectors_used: number;
  purchased_protectors_used: number;
};

export type StreakData = {
  current_streak: number;
  max_streak: number;
  last_completion_date: string | null;
  free_protectors_used: number;
  free_protectors_limit: number;
  purchased_protectors: number;
  is_active_today: boolean;
  last_7_days: DayHistory[];
};

export function useStreak() {
  const { streak, isLoading, fetchStreak } = useStreakStore();
  return {
    streak,
    isLoading,
    fetchStreak,
  };
}