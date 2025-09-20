"use client";

import { useLayoutEffect } from "react";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

export const MobileSizeListener = () => {
  const { setIsMobile } = usePlatformInfoStore();

  useLayoutEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 850);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [setIsMobile]);

  return null;
};
