"use client";

import { create } from "zustand";
import {
  getUserCoinsAction,
  getShopCatalogAction,
  redeemPromoCodeAction,
  buyStreakPackageAction,
  CoinPack,
  StreakPackage,
} from "@/lib/api/shop/actions";
import { useStreakStore } from "@/store/useStreakStore";

interface ShopStore {
  coins: number;
  coinPacks: CoinPack[];
  streakPackages: StreakPackage[];
  isLoading: boolean;
  isRedeeming: boolean;
  isPurchasing: boolean;
  fetchShopData: (force?: boolean) => Promise<void>;
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  buyStreakPackage: (packageId: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  setCoins: (amount: number) => void;
}

let activeShopPromise: Promise<void> | null = null;
let lastShopFetchTimestamp = 0;
const SHOP_CACHE_TTL_MS = 25000;

export const useShopStore = create<ShopStore>((set, get) => ({
  coins: 0,
  coinPacks: [],
  streakPackages: [],
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
        const [coinsRes, catalogRes] = await Promise.all([
          getUserCoinsAction(),
          getShopCatalogAction(),
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
      return { success: false, error: res.error || "No se pudo canjear el código." };
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

        return { success: true, message: res.message };
      }
      return { success: false, error: res.error || "No se pudo realizar la compra." };
    } finally {
      set({ isPurchasing: false });
    }
  },

  setCoins: (amount: number) => set({ coins: amount }),
}));
