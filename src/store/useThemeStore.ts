"use client";

import { create } from "zustand";
const Cookies = require("js-cookie");

interface ThemeState {
  theme: "light" | "dark" | "device";
  appliedTheme: "light" | "dark";
  toggleTheme: () => void;
  setThemeDark: () => void;
  setThemeLight: () => void;
  setThemeDevice: () => void;
  setAppliedTheme: (value: "light" | "dark") => void;
}

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const data = Cookies.get("theme-storage");
  if (data === "light" || data === "dark") return data;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const getInitialTheme = (): "light" | "dark" | "device" => {
  const data = Cookies.get("theme-storage");
  return data === "device" || data === "light" || data === "dark"
    ? data
    : "device";
};

const useThemeStore = create<ThemeState>()((set) => ({
  theme: getInitialTheme(),
  appliedTheme: getSystemTheme(),

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      Cookies.set("theme-storage", newTheme);
      return { theme: newTheme, appliedTheme: newTheme };
    }),

  setThemeDark: () =>
    set(() => {
      Cookies.set("theme-storage", "dark");
      return { theme: "dark", appliedTheme: "dark" };
    }),

  setThemeLight: () =>
    set(() => {
      Cookies.set("theme-storage", "light");
      return { theme: "light", appliedTheme: "light" };
    }),

  setThemeDevice: () =>
    set(() => {
      Cookies.set("theme-storage", "device");
      const systemTheme = getSystemTheme();
      return {
        theme: "device",
        appliedTheme: systemTheme,
      };
    }),

  setAppliedTheme: (value: "light" | "dark") =>
    set(() => {
      return { appliedTheme: value };
    }),
}));

export default useThemeStore;
