"use client";

import { useEffect, useState } from "react";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { PwaDrawer } from "./modal";

export function WpaDownloadModal() {
  const [open, setOpen] = useState(false);
  const { isMobile, isStandalone } = usePlatformInfoStore();
  const { uxPwaPrompt, toggleUxPwaPrompt } = useUserPreferencesStore();

  const shouldShow = isMobile === true && !isStandalone && uxPwaPrompt;

  useEffect(() => {
    if (!shouldShow) return;
    const timer = setTimeout(() => setOpen(true), 60_000);
    return () => clearTimeout(timer);
  }, [shouldShow]);

  if (!shouldShow) return null;

  return (
    <PwaDrawer
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) toggleUxPwaPrompt();
      }}
    />
  );
}
