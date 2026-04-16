"use client"

import { LayoutItem, ResponsiveLayouts } from "react-grid-layout";

import {
  PredefinedWidget,
  WidgetInstance,
  WidgetLayoutItem,
} from "@/lib/schemas/dashboard.types";

const TIER_ORDER: Record<string, number> = { free: 0, student: 1, pro: 2, ultra: 3 };

export const tierSatisfies = (userTier: string, required: string): boolean =>
  (TIER_ORDER[userTier] ?? 0) >= (TIER_ORDER[required] ?? 0);

export const buildLayoutsFromInstances = (
  instances: WidgetInstance[],
): ResponsiveLayouts => {
  const installed = instances.filter((i) => i.isInstalled);

  const applyMeta = (
    item: WidgetLayoutItem | null | undefined,
    pwIsResizable: boolean | null,
  ): LayoutItem | null => {
    if (!item) return null;
    const isResizable =
      pwIsResizable === false ? false : (item.isResizable ?? true);
    return { ...item, isResizable };
  };

  return {
    lg: installed
      .map((i) => applyMeta(i.layoutLg, i.pwIsResizable))
      .filter(Boolean) as LayoutItem[],
    md: installed
      .map((i) => applyMeta(i.layoutMd, i.pwIsResizable))
      .filter(Boolean) as LayoutItem[],
    xs: installed
      .map((i) => applyMeta(i.layoutXs, i.pwIsResizable))
      .filter(Boolean) as LayoutItem[],
  };
};

export const packItems = (
  items: readonly LayoutItem[],
  cols: number,
): LayoutItem[] => {
  const sorted = [...items].sort((a, b) =>
    a.y !== b.y ? a.y - b.y : a.x - b.x,
  );

  const colHeights = new Array(cols).fill(0);
  const result: LayoutItem[] = [];

  for (const item of sorted) {
    const w = Math.min(item.w || 1, cols);
    const h = item.h || 1;

    let bestX = 0;
    let bestY = Infinity;

    for (let x = 0; x <= cols - w; x++) {
      const landingY = Math.max(...colHeights.slice(x, x + w));
      if (landingY < bestY) {
        bestY = landingY;
        bestX = x;
      }
    }

    result.push({ ...item, x: bestX, y: bestY });

    for (let c = bestX; c < bestX + w; c++) {
      colHeights[c] = bestY + h;
    }
  }

  return result;
};

export const getLayoutItemForNewWidget = (
  widgetKey: string,
  breakpoint: "lg" | "md" | "xs",
  predefinedWidgets: PredefinedWidget[],
  existingInstances: WidgetInstance[],
): WidgetLayoutItem => {
  const cols = breakpoint === "lg" ? 3 : 1;

  const def = predefinedWidgets.find((w) => w.id === widgetKey);
  const defLayout =
    breakpoint === "lg"
      ? def?.defaultLayoutLg
      : breakpoint === "md"
        ? def?.defaultLayoutMd
        : def?.defaultLayoutXs;

  const candidate: LayoutItem = defLayout
    ? { ...defLayout, i: widgetKey }
    : {
        i: widgetKey,
        x: 0,
        y: 0,
        w: 1,
        h: 1,
        minW: 1,
        maxW: cols,
        minH: 1,
        isResizable: def?.isResizable ?? true,
      };

  const currentItems = existingInstances
    .filter((i) => i.isInstalled && i.widgetKey !== widgetKey)
    .map((i) => {
      const l =
        breakpoint === "lg"
          ? i.layoutLg
          : breakpoint === "md"
            ? i.layoutMd
            : i.layoutXs;
      return l ?? { i: i.widgetKey, x: 0, y: 0, w: 1, h: 1 };
    });

  const packed = packItems([...currentItems, candidate], cols);
  const placed = packed.find((l) => l.i === widgetKey);

  return {
    ...(placed ?? candidate),
    i: widgetKey,
    minW: candidate.minW,
    maxW: candidate.maxW,
    minH: candidate.minH,
    maxH: candidate.maxH,
    isResizable: def?.isResizable ?? (candidate.isResizable ?? true),
  } as WidgetLayoutItem;
};
