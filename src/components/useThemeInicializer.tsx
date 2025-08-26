"use client";

import { useEffect } from "react";

import useThemeStore from "@/store/useThemeStore";

export const ThemeInitializer = () => {
  const { theme, appliedTheme, setAppliedTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appliedTheme);
  }, [appliedTheme]);

  useEffect(() => {
    if (theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setAppliedTheme(e.matches ? "dark" : "light");
    };

    setAppliedTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme /*, appliedTheme*/]);

  return null;
};
