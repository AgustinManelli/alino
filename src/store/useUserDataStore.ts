"use client";

import { createContext, useContext } from "react";
import { createStore, StoreApi, useStore } from "zustand";

import { UserType } from "@/lib/schemas/database.types";
import { ProfileStats, FeatureUsage } from "@/lib/schemas/user.types";

export interface UserState {
  user: UserType | null;
  configUserActive: boolean;
  profileStats: ProfileStats | null;
  aiUsage: FeatureUsage | null;

  updateUser: (partial: Partial<UserType>) => void;
  setConfigUserActive: (active: boolean) => void;
  setProfileStats: (stats: ProfileStats) => void;
  setAIUsage: (usage: FeatureUsage) => void;
}

export const UserStoreContext = createContext<StoreApi<UserState> | undefined>(
  undefined,
);

export let globalUserStore: StoreApi<UserState> | undefined = undefined;

export const createUserDataStore = (initialState: Partial<UserState> = {}) => {
  const store = createStore<UserState>()((set, get) => ({
    user: initialState.user || null,
    configUserActive: false,
    profileStats: null,
    aiUsage: null,

    updateUser: (partial) =>
      set((state) => ({
        user: state.user ? { ...state.user, ...partial } : null,
      })),

    setConfigUserActive: (active) => set({ configUserActive: active }),

    setProfileStats: (stats) => set({ profileStats: stats }),
    setAIUsage: (usage) => set({ aiUsage: usage }),
  }));

  if (typeof window !== "undefined") {
    globalUserStore = store;
  }

  return store;
};

export const useUserDataStore = <T,>(selector: (state: UserState) => T): T => {
  const store = useContext(UserStoreContext);
  if (!store) {
    throw new Error("Missing UserStoreProvider in the tree");
  }
  return useStore(store, selector);
};