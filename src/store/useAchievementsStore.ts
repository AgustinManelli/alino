"use client";

import { create } from "zustand";
import {
  AchievementsOverview,
  ClaimRewardResult,
  LevelItem,
} from "@/lib/schemas/database.types";
import {
  getUserAchievementsAction,
  claimAchievementRewardAction,
  syncUserAchievementsAction,
} from "@/lib/api/achievements/actions";
import { getLevelsRoadmapAction } from "@/lib/api/levels/actions";
import { useShopStore } from "@/store/useShopStore";
import { globalUserStore } from "@/store/useUserDataStore";

interface AchievementsState {
  overview: AchievementsOverview | null;
  levels: LevelItem[];
  isLoading: boolean;
  isClaimingId: string | null;
  isGalleryOpen: boolean;

  fetchAchievements: (force?: boolean) => Promise<void>;
  fetchLevels: () => Promise<void>;
  claimReward: (achievementId: string) => Promise<ClaimRewardResult>;
  syncAchievements: () => Promise<void>;
  setIsGalleryOpen: (open: boolean) => void;
}

export const useAchievementsStore = create<AchievementsState>((set, get) => ({
  overview: null,
  levels: [],
  isLoading: false,
  isClaimingId: null,
  isGalleryOpen: false,

  fetchAchievements: async (force = false) => {
    if (get().isLoading) return;
    if (!force && get().overview) return;

    set({ isLoading: true });
    try {
      const res = await getUserAchievementsAction();
      if (res.data) {
        const levels = res.data.levels || get().levels;
        set({ overview: res.data, levels });
      }
      if (get().levels.length === 0) {
        const levelsRes = await getLevelsRoadmapAction();
        if (levelsRes.data && levelsRes.data.length > 0) {
          set({ levels: levelsRes.data });
        }
      }
    } finally {
      set({ isLoading: false });
    }
  },

  fetchLevels: async () => {
    if (get().levels.length > 0) return;
    const res = await getLevelsRoadmapAction();
    if (res.data && res.data.length > 0) {
      set({ levels: res.data });
    }
  },

  claimReward: async (achievementId: string) => {
    set({ isClaimingId: achievementId });
    try {
      const res = await claimAchievementRewardAction(achievementId);
      if (res.success) {
        set((state) => {
          if (!state.overview) return state;

          const updatedAchievements = state.overview.achievements.map((item) =>
            item.id === achievementId
              ? {
                  ...item,
                  is_claimed: true,
                  claimed_at: new Date().toISOString(),
                }
              : item
          );

          const claimedCount = updatedAchievements.filter(
            (a) => a.is_claimed
          ).length;

          return {
            overview: {
              ...state.overview,
              xp: res.new_xp,
              level: res.new_level,
              claimed_count: claimedCount,
              achievements: updatedAchievements,
            },
          };
        });

        useShopStore.getState().setCoins(res.new_coins);

        if (globalUserStore) {
          globalUserStore.getState().updateUser({
            xp: res.new_xp,
            level: res.new_level,
            alino_coins: res.new_coins,
          });
        }
      }
      return res;
    } finally {
      set({ isClaimingId: null });
    }
  },

  syncAchievements: async () => {
    try {
      const res = await syncUserAchievementsAction();
      if (res.unlocked && res.unlocked.length > 0) {
        await get().fetchAchievements(true);
      }
    } catch {
      return;
    }
  },

  setIsGalleryOpen: (open: boolean) => set({ isGalleryOpen: open }),
}));
