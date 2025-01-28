"use client";

import { useEffect } from "react";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

export const MobileSizeListener = () => {
  const { setIsMobile } = usePlatformInfoStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 850);
    };

    if (typeof window !== "undefined") {
      handleResize();
      window.addEventListener("resize", handleResize);

      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  }, []);

  return null;
};
