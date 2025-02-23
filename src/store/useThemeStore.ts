"use client";

import { create } from "zustand";
const Cookies = require("js-cookie");

interface theme_interface {
  theme: "light" | "dark" | "system";
  appliedTheme: "light" | "dark";
  toggleTheme: () => void;
  setDarkTheme: () => void;
  setLightTheme: () => void;
  setSystemTheme: () => void;
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

const getInitialTheme = (): "light" | "dark" | "system" => {
  const data = Cookies.get("theme-storage");
  return data === "system" || data === "light" || data === "dark"
    ? data
    : "system";
};

const useThemeStore = create<theme_interface>()((set) => ({
  theme: getInitialTheme(),
  appliedTheme: getSystemTheme(),

  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      Cookies.set("theme-storage", newTheme);
      return { theme: newTheme, appliedTheme: newTheme };
    }),

  setDarkTheme: () =>
    set(() => {
      Cookies.set("theme-storage", "dark");
      return { theme: "dark", appliedTheme: "dark" };
    }),

  setLightTheme: () =>
    set(() => {
      Cookies.set("theme-storage", "light");
      return { theme: "light", appliedTheme: "light" };
    }),

  setSystemTheme: () =>
    set(() => {
      Cookies.set("theme-storage", "system");
      const systemTheme = getSystemTheme();
      return {
        theme: "system",
        appliedTheme: systemTheme,
      };
    }),

  setAppliedTheme: (value: "light" | "dark") =>
    set(() => {
      return { appliedTheme: value };
    }),
}));

export default useThemeStore;
