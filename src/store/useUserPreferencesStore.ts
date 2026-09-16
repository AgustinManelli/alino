"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { updateUserPreferences } from "@/lib/api/user/actions";

export interface UserPreferences {
  animations: boolean;
  uxPwaPrompt: boolean;
  sidebarCollapsed: boolean;
  sidebarPosition: "left" | "right";
  soundEffects: boolean;
  taskCompletionSound: string;
  confirmDelete: boolean;
  firstDayOfWeek: "monday" | "sunday";
  compactView: boolean;

  initializePreferences: (prefs: any) => void;
  loadFallbackPreferences: () => void;
  toggleAnimations: () => void;
  toggleUxPwaPrompt: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarPosition: (position: "left" | "right") => void;
  toggleSoundEffects: () => void;
  setTaskCompletionSound: (soundId: string) => void;
  toggleConfirmDelete: () => void;
  setFirstDayOfWeek: (day: "monday" | "sunday") => void;
  toggleCompactView: () => void;
}

export const UserPreferencesContext = createContext<StoreApi<UserPreferences> | undefined>(undefined);

const STORAGE_KEY = "user-preferences";

const setCookie = (name: string, value: string) => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=${value}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

export let globalPrefsStore: StoreApi<UserPreferences> | undefined = undefined;

export const createUserPreferencesStore = (initialState: Partial<UserPreferences> = {}) => {
  let localStored: Partial<UserPreferences> = {};
  if (typeof window !== "undefined") {
    try {
      localStored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    } catch (_) { }
  }

  const merged = {
    ...localStored,
    ...initialState,
  };

  const persistToLocalStorage = (prefs: Partial<UserPreferences>) => {
    if (typeof window !== "undefined") {
      try {
        const currentStored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ ...currentStored, ...prefs })
        );
      } catch (_) { }
    }
  };

  const syncWithDatabase = async (prefs: Partial<UserPreferences>) => {
    try {
      await updateUserPreferences(prefs);
    } catch (err) {
      console.error("Failed to sync preferences with database:", err);
    }
  };

  const store = createStore<UserPreferences>()((set, get) => ({
    animations: merged.animations ?? true,
    uxPwaPrompt: merged.uxPwaPrompt ?? true,
    sidebarCollapsed: merged.sidebarCollapsed ?? false,
    sidebarPosition: (merged.sidebarPosition as "left" | "right") ?? "left",
    soundEffects: merged.soundEffects ?? false,
    taskCompletionSound: (merged.taskCompletionSound as string) ?? "check-1",
    confirmDelete: merged.confirmDelete ?? true,
    firstDayOfWeek: (merged.firstDayOfWeek as "monday" | "sunday") ?? "monday",
    compactView: merged.compactView ?? false,

    initializePreferences: (prefs: Partial<UserPreferences>) => {
      set((state) => ({ ...state, ...prefs }));
    },
    loadFallbackPreferences: () => { },

    toggleAnimations: () => {
      const nextVal = !get().animations;
      set({ animations: nextVal });
      persistToLocalStorage({ animations: nextVal });
      syncWithDatabase({ animations: nextVal });
    },

    toggleUxPwaPrompt: () => {
      const nextVal = !get().uxPwaPrompt;
      set({ uxPwaPrompt: nextVal });
      persistToLocalStorage({ uxPwaPrompt: nextVal });
      syncWithDatabase({ uxPwaPrompt: nextVal });
    },

    setSidebarCollapsed: (collapsed: boolean) => {
      set({ sidebarCollapsed: collapsed });
      persistToLocalStorage({ sidebarCollapsed: collapsed });
      setCookie("sidebar-collapsed", String(collapsed));
    },

    setSidebarPosition: (position: "left" | "right") => {
      set({ sidebarPosition: position });
      persistToLocalStorage({ sidebarPosition: position });
      setCookie("sidebar-position", position);
      syncWithDatabase({ sidebarPosition: position });
    },

    toggleSoundEffects: () => {
      const nextVal = !get().soundEffects;
      set({ soundEffects: nextVal });
      persistToLocalStorage({ soundEffects: nextVal });
      syncWithDatabase({ soundEffects: nextVal });
    },

    setTaskCompletionSound: (soundId: string) => {
      set({ taskCompletionSound: soundId });
      persistToLocalStorage({ taskCompletionSound: soundId });
      syncWithDatabase({ taskCompletionSound: soundId });
    },

    toggleConfirmDelete: () => {
      const nextVal = !get().confirmDelete;
      set({ confirmDelete: nextVal });
      persistToLocalStorage({ confirmDelete: nextVal });
      syncWithDatabase({ confirmDelete: nextVal });
    },

    setFirstDayOfWeek: (day: "monday" | "sunday") => {
      set({ firstDayOfWeek: day });
      persistToLocalStorage({ firstDayOfWeek: day });
      syncWithDatabase({ firstDayOfWeek: day });
    },

    toggleCompactView: () => {
      const nextVal = !get().compactView;
      set({ compactView: nextVal });
      persistToLocalStorage({ compactView: nextVal });
      syncWithDatabase({ compactView: nextVal });
    },
  }));

  if (typeof window !== "undefined") {
    globalPrefsStore = store;
  }

  return store;
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
    let initialSoundEffects = false;
    let initialTaskCompletionSound = "check-1";
    let initialConfirmDelete = true;
    let initialFirstDayOfWeek: "monday" | "sunday" = "monday";
    let initialCompactView = false;

    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      initialCollapsed = stored.sidebarCollapsed ?? false;
      initialPosition = stored.sidebarPosition ?? "left";
      initialAnimations = stored.animations ?? true;
      initialUxPwaPrompt = stored.uxPwaPrompt ?? true;
      initialSoundEffects = stored.soundEffects ?? false;
      initialTaskCompletionSound = stored.taskCompletionSound ?? "check-1";
      initialConfirmDelete = stored.confirmDelete ?? true;
      initialFirstDayOfWeek = stored.firstDayOfWeek ?? "monday";
      initialCompactView = stored.compactView ?? false;
    } catch (_) { }

    fallbackStore = createUserPreferencesStore({
      sidebarCollapsed: initialCollapsed,
      sidebarPosition: initialPosition,
      animations: initialAnimations,
      uxPwaPrompt: initialUxPwaPrompt,
      soundEffects: initialSoundEffects,
      taskCompletionSound: initialTaskCompletionSound,
      confirmDelete: initialConfirmDelete,
      firstDayOfWeek: initialFirstDayOfWeek,
      compactView: initialCompactView,
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

