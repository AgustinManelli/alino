import { Database } from "./database.types";

export type SubscriptionTier = Database["public"]["Enums"]["subscription_tier"];
export type WidgetModerationStatus = Database["public"]["Enums"]["widget_moderation_status"];

export interface WidgetLayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  isResizable?: boolean;
  static?: boolean;
}

export interface WidgetInstance {
  instanceId: string;
  widgetKey: string;
  widgetSource: "predefined" | "embedded";
  pwName: string | null;
  pwDescription: string | null;
  pwCategory: string | null;
  pwTierRequired: SubscriptionTier | null;
  pwIsResizable: boolean | null;
  uwTitle: string | null;
  uwUrl: string | null;
  uwConfig: Record<string, unknown> | null;
  uwIsPublic: boolean | null;
  uwModerationStatus: WidgetModerationStatus | null;
  layoutLg: WidgetLayoutItem | null;
  layoutMd: WidgetLayoutItem | null;
  layoutXs: WidgetLayoutItem | null;
  isInstalled: boolean;
}

export interface PredefinedWidget {
  id: string;
  name: string;
  description: string | null;
  category: string;
  tierRequired: SubscriptionTier;
  isActive: boolean;
  isResizable: boolean;
  defaultLayoutLg: WidgetLayoutItem | null;
  defaultLayoutMd: WidgetLayoutItem | null;
  defaultLayoutXs: WidgetLayoutItem | null;
  sortOrder: number;
}

export interface WidgetInstanceUpsertPayload {
  predefined_widget_id?: string | null;
  user_widget_id?: string | null;
  layout_lg: WidgetLayoutItem | null;
  layout_md: WidgetLayoutItem | null;
  layout_xs: WidgetLayoutItem | null;
  is_installed: boolean;
}

export interface WidgetLimits {
  free: number;
  student: number;
  pro: number;
  ultra: number;
}

export interface DashboardFullPayload {
  catalog: PredefinedWidget[];
  instances: WidgetInstance[];
}