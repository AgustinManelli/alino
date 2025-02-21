"use client";

import { create } from "zustand";
const Cookies = require("js-cookie");

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
}

const getInitialTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  const data = Cookies.get("theme-storage");
  return data
    ? data
    : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
};

const useThemeStore = create<ThemeState>()((set) => ({
  theme: getInitialTheme(),
  toggleTheme: () =>
    set((state) => {
      const newTheme = state.theme === "light" ? "dark" : "light";
      // if (typeof document !== "undefined") {
      //   document.documentElement.setAttribute("data-theme", newTheme);
      // }
      Cookies.set("theme-storage", newTheme);
      return { theme: newTheme };
    }),
}));

export default useThemeStore;
