"use client";

import { useEffect, useState } from "react";

export function useDeferredLoading(
  isLoading: boolean,
  delay: number = 150,
): boolean {
  const [isDeferred, setIsDeferred] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      setIsDeferred(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsDeferred(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [isLoading, delay]);

  return isDeferred;
}
