"use client";

import useThemeStore from "@/store/useThemeStore";
import { useEffect } from "react";

const ThemeInitializer = () => {
  const theme = useThemeStore((store) => store.theme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return null;
};

export default ThemeInitializer;
