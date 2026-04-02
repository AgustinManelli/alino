"use client";

import { useLayoutEffect } from "react";

import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

export const MobileSizeListener = () => {
  const { setIsMobile } = usePlatformInfoStore();

  useLayoutEffect(() => {
    const mq = window.matchMedia("(max-width: 850px)");
    const handleChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);

    setIsMobile(mq.matches);
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, [setIsMobile]);

  return null;
};
