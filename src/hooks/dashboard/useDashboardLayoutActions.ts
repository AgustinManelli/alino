"use client"

import { useCallback } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { packItems } from "@/store/dashboardUtils";

export function useDashboardLayoutActions() {
  const setLayout = useDashboardStore((s) => s.setLayout);

  const autoSortLayout = useCallback((breakpoint?: "lg" | "md" | "xs") => {
    const { layout } = useDashboardStore.getState();
    
    if (breakpoint) {
      const currentItems = layout[breakpoint] || [];
      const cols = breakpoint === "lg" ? 3 : 1;
      const sorted = packItems(currentItems, cols);
      setLayout({ ...layout, [breakpoint]: sorted });
    } else {
      const newLayout = { ...layout };
      (["lg", "md", "xs"] as const).forEach((bp) => {
        const items = layout[bp] || [];
        const cols = bp === "lg" ? 3 : 1;
        newLayout[bp] = packItems(items, cols);
      });
      setLayout(newLayout);
    }
  }, [setLayout]);

  return { autoSortLayout };
}
