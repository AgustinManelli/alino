import type { ComponentType } from "react";

export type WidgetTier = "free" | "student" | "pro" | "ultra";

export type WidgetCategory = "productivity" | "wellness" | "info" | "custom";

export interface WidgetDimensions {
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface WidgetProps {
  instanceId?: string;
  isEdit?: boolean;
  label?: string;
}

export interface CompanionProps {
  instanceId?: string;
  className?: string;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
}

export interface WidgetManifest {
  id: string;
  name: string;
  category: WidgetCategory;
  tierRequired: WidgetTier;
  defaultDimensions: WidgetDimensions;
  hasCompanionOverlay?: boolean;
  color?: string;
  withoutHeader?: boolean;
  withoutTopPadding?: boolean;
  scrollable?: boolean;
}

export interface WidgetModule {
  MainComponent: ComponentType<WidgetProps>;
  CompanionOverlay?: ComponentType<CompanionProps>;
  onUninstall?: () => void;
}
