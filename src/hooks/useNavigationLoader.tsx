"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoaderStore } from "@/store/useLoaderStore";

export const useNavigationLoader = () => {
  const { setLoading } = useLoaderStore();
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [pathname]);

  return { setLoading };
};
