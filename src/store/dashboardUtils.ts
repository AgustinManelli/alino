"use client";

import { LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import {
  PredefinedWidget,
  WidgetInstance,
  WidgetLayoutItem,
} from "@/lib/schemas/dashboard.types";

const TIER_ORDER: Record<string, number> = {
  free: 0,
  student: 1,
  pro: 2,
  ultra: 3,
};

export const tierSatisfies = (userTier: string, required: string): boolean =>
  (TIER_ORDER[userTier] ?? 0) >= (TIER_ORDER[required] ?? 0);

export const buildLayoutsFromInstances = (
  instances: WidgetInstance[],
): ResponsiveLayouts => {
  const installed = instances.filter((i) => i.isInstalled);

  const applyMeta = (
    item: WidgetLayoutItem | null | undefined,
    pwIsResizable: boolean | null,
    isMobile: boolean,
  ): LayoutItem | null => {
    if (!item) return null;
    const isResizable = isMobile
      ? false
      : pwIsResizable === false
        ? false
        : (item.isResizable ?? true);
    return {
      ...item,
      x: isMobile ? 0 : item.x,
      w: isMobile ? 1 : item.w,
      isResizable,
    };
  };

  return {
    lg: installed
      .map((i) => applyMeta(i.layoutLg, i.pwIsResizable, false))
      .filter((item): item is LayoutItem => item !== null),
    md: installed
      .map((i) => applyMeta(i.layoutMd, i.pwIsResizable, true))
      .filter((item): item is LayoutItem => item !== null),
    xs: installed
      .map((i) => applyMeta(i.layoutXs, i.pwIsResizable, true))
      .filter((item): item is LayoutItem => item !== null),
  };
};

export const findFirstAvailableSlot = (
  w: number,
  h: number,
  cols: number,
  occupiedItems: readonly LayoutItem[],
): { x: number; y: number } => {
  const targetW = Math.min(Math.max(w, 1), cols);
  const targetH = Math.max(h, 1);

  const isCellOccupied = (cellX: number, cellY: number): boolean => {
    return occupiedItems.some(
      (item) =>
        cellX >= item.x &&
        cellX < item.x + item.w &&
        cellY >= item.y &&
        cellY < item.y + item.h,
    );
  };

  let currentY = 0;
  while (currentY < 1000) {
    for (let currentX = 0; currentX <= cols - targetW; currentX++) {
      let canFit = true;
      for (let dy = 0; dy < targetH; dy++) {
        for (let dx = 0; dx < targetW; dx++) {
          if (isCellOccupied(currentX + dx, currentY + dy)) {
            canFit = false;
            break;
          }
        }
        if (!canFit) break;
      }

      if (canFit) {
        return { x: currentX, y: currentY };
      }
    }
    currentY++;
  }

  return { x: 0, y: currentY };
};

export const compactLayout = (
  items: readonly LayoutItem[],
  cols: number,
): LayoutItem[] => {
  const sorted = [...items].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x,
  );

  const placedItems: LayoutItem[] = [];

  for (const item of sorted) {
    const w = cols === 1 ? 1 : Math.min(item.w || 1, cols);
    const h = item.h || 1;
    const slot = findFirstAvailableSlot(w, h, cols, placedItems);
    placedItems.push({
      ...item,
      x: cols === 1 ? 0 : slot.x,
      y: slot.y,
      w,
      h,
    });
  }

  return placedItems;
};

export const packItems = compactLayout;

export const getLayoutItemForNewWidget = (
  widgetKey: string,
  breakpoint: "lg" | "md" | "xs",
  predefinedWidgets: PredefinedWidget[],
  existingInstances: WidgetInstance[],
): WidgetLayoutItem => {
  const cols = breakpoint === "lg" ? 3 : 1;
  const isMobile = breakpoint !== "lg";

  const def = predefinedWidgets.find((w) => w.id === widgetKey);
  const defLayout =
    breakpoint === "lg"
      ? def?.defaultLayoutLg
      : breakpoint === "md"
        ? def?.defaultLayoutMd
        : def?.defaultLayoutXs;

  const rawW = defLayout?.w ?? 1;
  const rawH = defLayout?.h ?? 1;
  const w = isMobile ? 1 : Math.min(Math.max(rawW, 1), cols);
  const h = Math.max(rawH, 1);

  const currentItems = existingInstances
    .filter((i) => i.isInstalled && i.widgetKey !== widgetKey)
    .map((i) => {
      const l =
        breakpoint === "lg"
          ? i.layoutLg
          : breakpoint === "md"
            ? i.layoutMd
            : i.layoutXs;
      return l
        ? {
            i: i.widgetKey,
            x: isMobile ? 0 : l.x,
            y: l.y,
            w: isMobile ? 1 : Math.min(l.w, cols),
            h: l.h,
          }
        : { i: i.widgetKey, x: 0, y: 0, w: 1, h: 1 };
    });

  const slot = findFirstAvailableSlot(w, h, cols, currentItems);

  return {
    i: widgetKey,
    x: isMobile ? 0 : slot.x,
    y: slot.y,
    w,
    h,
    minW: isMobile ? 1 : (defLayout?.minW ?? 1),
    maxW: isMobile ? 1 : (defLayout?.maxW ?? cols),
    minH: defLayout?.minH ?? 1,
    maxH: defLayout?.maxH,
    isResizable: isMobile ? false : (def?.isResizable ?? true),
  };
};
