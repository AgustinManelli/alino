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
  ShopBanner,
  getActiveShopBannerAction,
} from "@/lib/api/shop/actions";
import { getShopCosmeticsCatalogAction } from "@/lib/api/cosmetics/actions";
import { AICreditPack, CosmeticItem } from "@/lib/schemas/database.types";
import { useStreakStore } from "@/store/useStreakStore";
import { globalUserStore } from "@/store/useUserDataStore";

interface ShopStore {
  coins: number;
  extraAICredits: number;
  coinPacks: CoinPack[];
  streakPackages: StreakPackage[];
  aiCreditPacks: AICreditPack[];
  cosmetics: CosmeticItem[];
  activeBanner: ShopBanner | null;
  isLoading: boolean;
  error: string | null;
  isRedeeming: boolean;
  isPurchasing: boolean;
  fetchShopData: (force?: boolean) => Promise<void>;
  redeemPromoCode: (code: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    errorCode?: string;
  }>;
  buyStreakPackage: (packageId: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    errorCode?: string;
    protectors_added?: number;
  }>;
  buyAICreditPack: (packId: string) => Promise<{
    success: boolean;
    message?: string;
    error?: string;
    errorCode?: string;
  }>;
  setCoins: (amount: number) => void;
  setExtraAICredits: (amount: number) => void;
  setCosmetics: (cosmetics: CosmeticItem[]) => void;
  setActiveBanner: (banner: ShopBanner | null) => void;
  markCosmeticUnlocked: (cosmeticId: string) => void;
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
  cosmetics: [],
  activeBanner: null,
  isLoading: false,
  error: null,
  isRedeeming: false,
  isPurchasing: false,

  fetchShopData: async (force = false) => {
    const now = Date.now();
    if (activeShopPromise) {
      return activeShopPromise;
    }
    if (!force && now - lastShopFetchTimestamp < SHOP_CACHE_TTL_MS) {
      return;
    }

    set({ isLoading: true, error: null });
    const request = (async () => {
      try {
        const [coinsRes, catalogRes, aiPacksRes, cosmeticsRes, bannerRes] =
          await Promise.all([
            getUserCoinsAction(),
            getShopCatalogAction(),
            getShopAICreditPacksAction(),
            getShopCosmeticsCatalogAction({ pageSize: 12 }),
            getActiveShopBannerAction(),
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
        if (cosmeticsRes.data?.cosmetics) {
          set({ cosmetics: cosmeticsRes.data.cosmetics });
        }
        if (bannerRes?.data !== undefined) {
          set({ activeBanner: bannerRes.data });
        }
        const errors = [
          coinsRes.error,
          catalogRes.error,
          aiPacksRes.error,
          cosmeticsRes.error,
          bannerRes?.error,
        ].filter((error): error is string => Boolean(error));
        if (errors.length > 0) {
          set({ error: errors[0] });
          return;
        }
        lastShopFetchTimestamp = Date.now();
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "No se pudo cargar la tienda.",
        });
      } finally {
        set({ isLoading: false });
      }
    })();

    const trackedRequest = request.finally(() => {
      if (activeShopPromise === trackedRequest) {
        activeShopPromise = null;
      }
    });
    activeShopPromise = trackedRequest;

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
        if (
          streakState.streak &&
          typeof res.purchased_protectors === "number"
        ) {
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
      if (
        res.success &&
        typeof res.new_coins === "number" &&
        typeof res.new_extra_credits === "number"
      ) {
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
  setCosmetics: (cosmetics: CosmeticItem[]) => set({ cosmetics }),
  setActiveBanner: (banner: ShopBanner | null) => set({ activeBanner: banner }),
  markCosmeticUnlocked: (cosmeticId: string) =>
    set((state) => ({
      cosmetics: state.cosmetics.map((c) =>
        c.id === cosmeticId ? { ...c, is_unlocked: true } : c,
      ),
    })),
}));
