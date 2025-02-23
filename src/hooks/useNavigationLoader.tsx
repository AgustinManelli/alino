"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoaderStore } from "@/store/useLoaderStore";

export const useNavigationLoader = () => {
  const { setLoading } = useLoaderStore();
  const pathname = usePathname();

  useEffect(() => {
    const enableScroll = () => {
      document.documentElement.style.overflow = "auto";
      document.body.style.overflow = "auto";
    };

    const disableScroll = () => {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    };

    const timer = setTimeout(() => {
      setLoading(false);
      if (pathname === "/") {
        enableScroll();
      } else {
        disableScroll();
      }
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, setLoading]);

  return { setLoading };
};
