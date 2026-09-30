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

  dailyDigestEnabled: boolean;
  dailyDigestTime: string;
  dueRemindersEnabled: boolean;
  dueLeadTimeMinutes: number;
  streakSaverEnabled: boolean;
  streakSaverTime: string;
  engagementNudgesEnabled: boolean;
  timezone: string;

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
  setDailyDigestEnabled: (enabled: boolean) => void;
  setDailyDigestTime: (time: string) => void;
  setDueRemindersEnabled: (enabled: boolean) => void;
  setDueLeadTimeMinutes: (minutes: number) => void;
  setStreakSaverEnabled: (enabled: boolean) => void;
  setStreakSaverTime: (time: string) => void;
  setEngagementNudgesEnabled: (enabled: boolean) => void;
  setTimezone: (tz: string) => void;
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
      const res = await updateUserPreferences(prefs);
      if (res && "error" in res && res.error) {
        console.error("Failed to sync preferences with database:", res.error);
      }
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

    dailyDigestEnabled: merged.dailyDigestEnabled ?? (merged as any).daily_digest_enabled ?? true,
    dailyDigestTime: merged.dailyDigestTime ?? (merged as any).daily_digest_time ?? "09:00",
    dueRemindersEnabled: merged.dueRemindersEnabled ?? (merged as any).due_reminders_enabled ?? true,
    dueLeadTimeMinutes: merged.dueLeadTimeMinutes ?? (merged as any).due_lead_time_minutes ?? 30,
    streakSaverEnabled: merged.streakSaverEnabled ?? (merged as any).streak_saver_enabled ?? true,
    streakSaverTime: merged.streakSaverTime ?? (merged as any).streak_saver_time ?? "20:00",
    engagementNudgesEnabled: merged.engagementNudgesEnabled ?? (merged as any).engagement_nudges_enabled ?? true,
    timezone: merged.timezone ?? (merged as any).user_timezone ?? (typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "America/Argentina/Buenos_Aires") ?? "America/Argentina/Buenos_Aires",

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

    setDailyDigestEnabled: (enabled: boolean) => {
      set({ dailyDigestEnabled: enabled });
      persistToLocalStorage({ dailyDigestEnabled: enabled });
      syncWithDatabase({ dailyDigestEnabled: enabled });
    },

    setDailyDigestTime: (time: string) => {
      const cleanTime = (time || "").slice(0, 5);
      if (/^\d{1,2}:\d{2}$/.test(cleanTime)) {
        set({ dailyDigestTime: cleanTime });
        persistToLocalStorage({ dailyDigestTime: cleanTime });
        syncWithDatabase({ dailyDigestTime: cleanTime });
      } else {
        set({ dailyDigestTime: time });
      }
    },

    setDueRemindersEnabled: (enabled: boolean) => {
      set({ dueRemindersEnabled: enabled });
      persistToLocalStorage({ dueRemindersEnabled: enabled });
      syncWithDatabase({ dueRemindersEnabled: enabled });
    },

    setDueLeadTimeMinutes: (minutes: number) => {
      const valid = Number(minutes) || 30;
      set({ dueLeadTimeMinutes: valid });
      persistToLocalStorage({ dueLeadTimeMinutes: valid });
      syncWithDatabase({ dueLeadTimeMinutes: valid });
    },

    setStreakSaverEnabled: (enabled: boolean) => {
      set({ streakSaverEnabled: enabled });
      persistToLocalStorage({ streakSaverEnabled: enabled });
      syncWithDatabase({ streakSaverEnabled: enabled });
    },

    setStreakSaverTime: (time: string) => {
      set({ streakSaverTime: time });
      persistToLocalStorage({ streakSaverTime: time });
      syncWithDatabase({ streakSaverTime: time });
    },

    setEngagementNudgesEnabled: (enabled: boolean) => {
      set({ engagementNudgesEnabled: enabled });
      persistToLocalStorage({ engagementNudgesEnabled: enabled });
      syncWithDatabase({ engagementNudgesEnabled: enabled });
    },

    setTimezone: (tz: string) => {
      set({ timezone: tz });
      persistToLocalStorage({ timezone: tz });
      syncWithDatabase({ timezone: tz });
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

    let stored: any = {};
    try {
      stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
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

    const initialDailyDigestEnabled = stored.dailyDigestEnabled ?? true;
    const initialDailyDigestTime = stored.dailyDigestTime ?? "09:00";
    const initialDueRemindersEnabled = stored.dueRemindersEnabled ?? true;
    const initialDueLeadTimeMinutes = stored.dueLeadTimeMinutes ?? 30;
    const initialStreakSaverEnabled = stored.streakSaverEnabled ?? true;
    const initialStreakSaverTime = stored.streakSaverTime ?? "20:00";
    const initialEngagementNudgesEnabled = stored.engagementNudgesEnabled ?? true;
    const initialTimezone =
      stored.timezone ??
      (typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "America/Argentina/Buenos_Aires") ??
      "America/Argentina/Buenos_Aires";

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
      dailyDigestEnabled: initialDailyDigestEnabled,
      dailyDigestTime: initialDailyDigestTime,
      dueRemindersEnabled: initialDueRemindersEnabled,
      dueLeadTimeMinutes: initialDueLeadTimeMinutes,
      streakSaverEnabled: initialStreakSaverEnabled,
      streakSaverTime: initialStreakSaverTime,
      engagementNudgesEnabled: initialEngagementNudgesEnabled,
      timezone: initialTimezone,
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
