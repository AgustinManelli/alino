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

    // Habilitar scroll en la ruta "/"
    if (pathname === "/") {
      enableScroll();
    } else {
      // Deshabilitar scroll en otras rutas
      disableScroll();
    }

    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      clearTimeout(timer);
      enableScroll();
    };
  }, [pathname]);

  return { setLoading };
};
