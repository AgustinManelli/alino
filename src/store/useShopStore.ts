"use client";

import { create } from "zustand";
import {
  getUserCoinsAction,
  getShopCatalogAction,
  getShopAICreditPacksAction,
  buyAICreditsAction,
  redeemPromoCodeAction,
  buyStreakPackageAction,
  CoinPack,
  StreakPackage,
} from "@/lib/api/shop/actions";
import { AICreditPack } from "@/lib/schemas/database.types";
import { useStreakStore } from "@/store/useStreakStore";
import { globalUserStore } from "@/store/useUserDataStore";

interface ShopStore {
  coins: number;
  extraAICredits: number;
  coinPacks: CoinPack[];
  streakPackages: StreakPackage[];
  aiCreditPacks: AICreditPack[];
  isLoading: boolean;
  isRedeeming: boolean;
  isPurchasing: boolean;
  fetchShopData: (force?: boolean) => Promise<void>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message?: string; error?: string; errorCode?: string }>;
  buyStreakPackage: (packageId: string) => Promise<{ success: boolean; message?: string; error?: string; errorCode?: string; protectors_added?: number }>;
  buyAICreditPack: (packId: string) => Promise<{ success: boolean; message?: string; error?: string; errorCode?: string }>;
  setCoins: (amount: number) => void;
  setExtraAICredits: (amount: number) => void;
}

let activeShopPromise: Promise<void> | null = null;
let lastShopFetchTimestamp = 0;
const SHOP_CACHE_TTL_MS = 25000;

export const useShopStore = create<ShopStore>((set, get) => ({
  coins: 0,
  extraAICredits: 0,
  coinPacks: [],
  streakPackages: [],
  aiCreditPacks: [],
  isLoading: false,
  isRedeeming: false,
  isPurchasing: false,

  fetchShopData: async (force = false) => {
    const now = Date.now();
    if (!force && activeShopPromise) {
      return activeShopPromise;
    }
    if (!force && now - lastShopFetchTimestamp < SHOP_CACHE_TTL_MS) {
      return;
    }

    set({ isLoading: true });
    activeShopPromise = (async () => {
      try {
        const [coinsRes, catalogRes, aiPacksRes] = await Promise.all([
          getUserCoinsAction(),
          getShopCatalogAction(),
          getShopAICreditPacksAction(),
        ]);

        if (typeof coinsRes.data === "number") {
          set({ coins: coinsRes.data });
        }
        if (catalogRes.data) {
          set({
            coinPacks: catalogRes.data.coin_packs || [],
            streakPackages: catalogRes.data.streak_packages || [],
          });
        }
        if (aiPacksRes.data) {
          set({
            aiCreditPacks: aiPacksRes.data.packs || [],
            extraAICredits: aiPacksRes.data.extra_ai_credits ?? 0,
          });
          if (typeof aiPacksRes.data.user_coins === "number") {
            set({ coins: aiPacksRes.data.user_coins });
          }
        }
        lastShopFetchTimestamp = Date.now();
      } finally {
        set({ isLoading: false });
        activeShopPromise = null;
      }
    })();

    return activeShopPromise;
  },

  redeemPromoCode: async (code: string) => {
    set({ isRedeeming: true });
    try {
      const res = await redeemPromoCodeAction(code);
      if (res.success && typeof res.new_balance === "number") {
        set({ coins: res.new_balance });
        return { success: true, message: res.message };
      }
      const errCode = res.errorCode || res.error || "GENERIC_ERROR";
      return { success: false, error: errCode, errorCode: errCode };
    } finally {
      set({ isRedeeming: false });
    }
  },

  buyStreakPackage: async (packageId: string) => {
    set({ isPurchasing: true });
    try {
      const res = await buyStreakPackageAction(packageId);
      if (res.success && typeof res.new_balance === "number") {
        set({ coins: res.new_balance });

        const streakState = useStreakStore.getState();
        if (streakState.streak && typeof res.purchased_protectors === "number") {
          useStreakStore.setState({
            streak: {
              ...streakState.streak,
              purchased_protectors: res.purchased_protectors,
            },
          });
        } else {
          streakState.fetchStreak(true);
        }

        return {
          success: true,
          message: res.message,
          protectors_added: res.protectors_added,
        };
      }
      const code = res.errorCode || res.error || "GENERIC_ERROR";
      return {
        success: false,
        error: code,
        errorCode: code,
      };
    } finally {
      set({ isPurchasing: false });
    }
  },

  buyAICreditPack: async (packId: string) => {
    set({ isPurchasing: true });
    try {
      const res = await buyAICreditsAction(packId);
      if (res.success && typeof res.new_coins === "number" && typeof res.new_extra_credits === "number") {
        set({
          coins: res.new_coins,
          extraAICredits: res.new_extra_credits,
        });

        const userStoreState = globalUserStore?.getState();
        if (userStoreState?.aiUsage) {
          userStoreState.setAIUsage({
            ...userStoreState.aiUsage,
            extra_remaining: res.new_extra_credits,
          });
        }

        return { success: true, message: res.message };
      }
      const code = res.errorCode || res.error || "GENERIC_ERROR";
      return { success: false, error: code, errorCode: code };
    } finally {
      set({ isPurchasing: false });
    }
  },

  setCoins: (amount: number) => set({ coins: amount }),
  setExtraAICredits: (amount: number) => set({ extraAICredits: amount }),
}));
