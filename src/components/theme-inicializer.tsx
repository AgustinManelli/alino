"use client";

import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";

const ThemeInitializer = () => {
  const { theme, appliedTheme, setAppliedTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", appliedTheme);
  }, [appliedTheme]);

  useEffect(() => {
    if (theme !== "device") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      setAppliedTheme(e.matches ? "dark" : "light");
    };

    setAppliedTheme(mediaQuery.matches ? "dark" : "light");
    mediaQuery.addEventListener("change", handleSystemThemeChange);
    return () =>
      mediaQuery.removeEventListener("change", handleSystemThemeChange);
  }, [theme, appliedTheme]);

  return null;
};

export default ThemeInitializer;
