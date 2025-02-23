"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useLoaderStore } from "@/store/useLoaderStore";

export const useNavigationLoader = () => {
  const { setLoading } = useLoaderStore();
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
