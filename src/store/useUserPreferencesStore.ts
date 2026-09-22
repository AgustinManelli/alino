"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { updateUserPreferences } from "@/lib/api/user/actions";
import i18n from "@/lib/i18n";
import { SupportedLanguage, DEFAULT_LANGUAGE } from "@/lib/i18n/types";

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
  language: SupportedLanguage;

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
  setLanguage: (lang: SupportedLanguage) => void;
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

  const initialLang: SupportedLanguage = (merged.language as SupportedLanguage) || DEFAULT_LANGUAGE;
  if (typeof window !== "undefined" && i18n.language !== initialLang) {
    i18n.changeLanguage(initialLang);
  }

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
    animations: localStored.animations !== undefined ? localStored.animations : true,
    uxPwaPrompt: merged.uxPwaPrompt ?? true,
    sidebarCollapsed: merged.sidebarCollapsed ?? false,
    sidebarPosition: (merged.sidebarPosition as "left" | "right") ?? "left",
    soundEffects: merged.soundEffects ?? false,
    taskCompletionSound: (merged.taskCompletionSound as string) ?? "check-1",
    confirmDelete: merged.confirmDelete ?? true,
    firstDayOfWeek: (merged.firstDayOfWeek as "monday" | "sunday") ?? "monday",
    compactView: merged.compactView ?? false,
    language: initialLang,

    initializePreferences: (prefs: Partial<UserPreferences>) => {
      const { animations, ...rest } = prefs;
      set((state) => ({ ...state, ...rest }));
      if (prefs.language) {
        i18n.changeLanguage(prefs.language);
      }
    },
    loadFallbackPreferences: () => { },

    toggleAnimations: () => {
      const nextVal = !get().animations;
      set({ animations: nextVal });
      persistToLocalStorage({ animations: nextVal });
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

    setLanguage: (lang: SupportedLanguage) => {
      set({ language: lang });
      persistToLocalStorage({ language: lang });
      setCookie("user-language", lang);
      syncWithDatabase({ language: lang });
      i18n.changeLanguage(lang);
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
    let initialLanguage: SupportedLanguage = DEFAULT_LANGUAGE;

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
      initialLanguage = stored.language ?? DEFAULT_LANGUAGE;
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
      language: initialLanguage,
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
