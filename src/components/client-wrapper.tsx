"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLoaderStore } from "@/store/useLoaderStore";

export const useNavigation = () => {
  const { setLoading } = useLoaderStore();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, [pathname, searchParams]);

  return { setLoading };
};
