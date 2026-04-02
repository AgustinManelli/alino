"use client";

import { useEffect } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";

function ThemeCookieSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!resolvedTheme) return;
    document.cookie = `theme-resolved=${resolvedTheme}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
  }, [resolvedTheme]);

  return null;
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="data-theme"
      defaultTheme="system" // respeta la preferencia del OS por defecto
      enableSystem // activa la detección de prefers-color-scheme
      disableTransitionOnChange // evita transiciones CSS al cambiar el tema
      storageKey="theme-storage"
      {...props}
    >
      <ThemeCookieSync />
      {children}
    </NextThemesProvider>
  );
}
