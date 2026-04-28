"use client"

import { useCallback } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { packItems } from "@/store/dashboardUtils";
import { useSaveWidgetLayouts } from "@/hooks/dashboard/useSaveWidgetLayouts";

export function useDashboardLayoutActions() {
  const setLayout = useDashboardStore((s) => s.setLayout);
  const { scheduleSave } = useSaveWidgetLayouts();

  const autoSortLayout = useCallback((breakpoint?: "lg" | "md" | "xs") => {
    const { layout } = useDashboardStore.getState();
    let newLayout = { ...layout };
    if (breakpoint) {
      const currentItems = layout[breakpoint] || [];
      const cols = breakpoint === "lg" ? 3 : 1;
      const sorted = packItems(currentItems, cols);
      newLayout[breakpoint] = sorted;
    } else {
      (["lg", "md", "xs"] as const).forEach((bp) => {
        const items = layout[bp] || [];
        const cols = bp === "lg" ? 3 : 1;
        newLayout[bp] = packItems(items, cols);
      });
    }
    setLayout(newLayout);

    const { widgetInstances, setWidgetInstances } = useDashboardStore.getState();
    const newInstances = widgetInstances.map(instance => {
      const id = instance.widgetKey;
      const lg = newLayout.lg?.find(l => l.i === id);
      const md = newLayout.md?.find(l => l.i === id);
      const xs = newLayout.xs?.find(l => l.i === id);
      return {
        ...instance,
        layoutLg: lg ? { i: id, x: lg.x, y: lg.y, w: lg.w, h: lg.h } : instance.layoutLg,
        layoutMd: md ? { i: id, x: md.x, y: md.y, w: md.w, h: md.h } : instance.layoutMd,
        layoutXs: xs ? { i: id, x: xs.x, y: xs.y, w: xs.w, h: xs.h } : instance.layoutXs,
      };
    });
    setWidgetInstances(newInstances);
    scheduleSave();
  }, [setLayout, scheduleSave]);

  return { autoSortLayout };
}
