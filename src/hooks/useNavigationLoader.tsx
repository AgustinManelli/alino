"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useUIStore } from "@/store/useUIStore";

export const useNavigationLoader = () => {
  const setLoading = useUIStore((state) => state.setLoading);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      //close loader
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, setLoading]);

  return { setLoading };
};
