"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { updateUserPreferences } from "@/lib/api/user/actions";

export interface UserPreferences {
  animations: boolean;
  uxPwaPrompt: boolean;
  sidebarCollapsed: boolean;
  sidebarPosition: "left" | "right";
  
  initializePreferences: (prefs: any) => void;
  loadFallbackPreferences: () => void;
  toggleAnimations: () => void;
  toggleUxPwaPrompt: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarPosition: (position: "left" | "right") => void;
}

export const UserPreferencesContext = createContext<StoreApi<UserPreferences> | undefined>(undefined);

const STORAGE_KEY = "user-preferences";

const setCookie = (name: string, value: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

export const createUserPreferencesStore = (initialState: Partial<UserPreferences> = {}) => {
  const persistToLocalStorage = (prefs: Partial<UserPreferences>) => {
    if (typeof window !== "undefined") {
      const currentStored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ ...currentStored, ...prefs })
      );
    }
  };

  const syncWithDatabase = async (prefs: Partial<UserPreferences>) => {
    try {
      await updateUserPreferences(prefs);
    } catch (err) {
      console.error("Failed to sync preferences with database:", err);
    }
  };

  return createStore<UserPreferences>()((set, get) => ({
    animations: initialState.animations ?? true,
    uxPwaPrompt: initialState.uxPwaPrompt ?? true,
    sidebarCollapsed: initialState.sidebarCollapsed ?? false,
    sidebarPosition: initialState.sidebarPosition ?? "left",

    initializePreferences: () => {},
    loadFallbackPreferences: () => {},

    toggleAnimations: () => {
      const nextVal = !get().animations;
      persistToLocalStorage({ animations: nextVal });
      syncWithDatabase({ animations: nextVal });
      set({ animations: nextVal });
    },

    toggleUxPwaPrompt: () => {
      const nextVal = !get().uxPwaPrompt;
      persistToLocalStorage({ uxPwaPrompt: nextVal });
      syncWithDatabase({ uxPwaPrompt: nextVal });
      set({ uxPwaPrompt: nextVal });
    },

    setSidebarCollapsed: (collapsed: boolean) => {
      persistToLocalStorage({ sidebarCollapsed: collapsed });
      setCookie("sidebar-collapsed", String(collapsed));
      set({ sidebarCollapsed: collapsed });
    },

    setSidebarPosition: (position: "left" | "right") => {
      persistToLocalStorage({ sidebarPosition: position });
      setCookie("sidebar-position", position);
      syncWithDatabase({ sidebarPosition: position });
      set({ sidebarPosition: position });
    },
  }));
};

let fallbackStore: StoreApi<UserPreferences> | undefined;

const getFallbackStore = () => {
  if (typeof window === "undefined") {
    return createUserPreferencesStore();
  }
  if (!fallbackStore) {
    let initialCollapsed = false;
    let initialPosition: "left" | "right" = "left";
    let initialAnimations = true;
    let initialUxPwaPrompt = true;

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      initialCollapsed = stored.sidebarCollapsed ?? false;
      initialPosition = stored.sidebarPosition ?? "left";
      initialAnimations = stored.animations ?? true;
      initialUxPwaPrompt = stored.uxPwaPrompt ?? true;
    } catch (_) {}

    fallbackStore = createUserPreferencesStore({
      sidebarCollapsed: initialCollapsed,
      sidebarPosition: initialPosition,
      animations: initialAnimations,
      uxPwaPrompt: initialUxPwaPrompt,
    });
  }
  return fallbackStore;
};

export const useUserPreferencesStore = <T = UserPreferences,>(
  selector: (state: UserPreferences) => T = (state) => state as unknown as T
): T => {
  const store = useContext(UserPreferencesContext) ?? getFallbackStore();
  return useStore(store, selector);
};

