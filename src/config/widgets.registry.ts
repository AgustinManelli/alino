import type { WidgetTier } from "@/types/widgetContract";

export type { WidgetTier };

const TIER_ORDER: Record<WidgetTier, number> = {
  free: 0,
  student: 1,
  pro: 2,
  ultra: 3,
};

export const tierSatisfies = (userTier: string, required: string): boolean => {
  const currentLevel = TIER_ORDER[userTier as WidgetTier] ?? 0;
  const requiredLevel = TIER_ORDER[required as WidgetTier] ?? 0;
  return currentLevel >= requiredLevel;
};

export const ONLINE_REQUIRED_WIDGETS = new Set<string>([
  "streak",
  "achievements",
  "new-features",
  "ai-planner",
]);

export const isWidgetOnlineOnly = (
  widgetKey: string,
  widgetSource?: string
): boolean => {
  if (widgetSource === "embedded") return true;
  return ONLINE_REQUIRED_WIDGETS.has(widgetKey);
};