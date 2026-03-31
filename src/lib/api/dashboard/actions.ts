"use server";

import { createClient } from "@/utils/supabase/server";
import {
  PredefinedWidget,
  WidgetInstance,
  WidgetLimits,
  DashboardFullPayload,
} from "@/lib/schemas/dashboard.types";
import { AppUpdatesType, DashboardData } from "@/lib/schemas/database.types";

const UNKNOWN_ERROR = "Error desconocido.";

const getAuth = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return { supabase, user: data.user };
};

export async function loadDashboardFull(): Promise<{
  data?: DashboardFullPayload;
  error?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("load_dashboard_full");
    if (error) throw new Error(error.message);

    const raw = data as { catalog: Record<string, unknown>[]; instances: Record<string, unknown>[] };

    const catalog: PredefinedWidget[] = (raw.catalog ?? []).map((w) => ({
      id:             w.id as string,
      name:           w.name as string,
      description:    w.description as string | null,
      category:       w.category as string,
      tierRequired:   w.tier_required as PredefinedWidget["tierRequired"],
      isActive:       w.is_active as boolean,
      isResizable:    w.is_resizable as boolean,
      defaultLayoutLg: w.default_layout_lg as PredefinedWidget["defaultLayoutLg"],
      defaultLayoutMd: w.default_layout_md as PredefinedWidget["defaultLayoutMd"],
      defaultLayoutXs: w.default_layout_xs as PredefinedWidget["defaultLayoutXs"],
      sortOrder:      w.sort_order as number,
    }));

    const instances: WidgetInstance[] = (raw.instances ?? []).map((r) => ({
      instanceId:          r.instance_id as string,
      widgetKey:           r.widget_key as string,
      widgetSource:        r.widget_source as "predefined" | "embedded",
      pwName:              r.pw_name as string | null,
      pwDescription:       r.pw_description as string | null,
      pwCategory:          r.pw_category as string | null,
      pwTierRequired:      r.pw_tier_required as WidgetInstance["pwTierRequired"],
      pwIsResizable:       r.pw_is_resizable as boolean | null,
      uwTitle:             r.uw_title as string | null,
      uwUrl:               r.uw_url as string | null,
      uwConfig:            r.uw_config as Record<string, unknown> | null,
      uwIsPublic:          r.uw_is_public as boolean | null,
      uwModerationStatus:  r.uw_moderation_status as WidgetInstance["uwModerationStatus"],
      layoutLg:            r.layout_lg as WidgetInstance["layoutLg"],
      layoutMd:            r.layout_md as WidgetInstance["layoutMd"],
      layoutXs:            r.layout_xs as WidgetInstance["layoutXs"],
      isInstalled:         r.is_installed as boolean,
    }));

    return { data: { catalog, instances } };
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function installWidgetAction(params: {
  predefinedId?: string;
  userWidgetId?: string;
  layoutLg?: WidgetInstance["layoutLg"];
  layoutMd?: WidgetInstance["layoutMd"];
  layoutXs?: WidgetInstance["layoutXs"];
}): Promise<{ error?: string }> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("install_widget", {
  p_predefined_id:  params.predefinedId ?? null,
  p_user_widget_id: params.userWidgetId ?? null,
  p_layout_lg:      params.layoutLg ?? null,
  p_layout_md:      params.layoutMd ?? null,
  p_layout_xs:      params.layoutXs ?? null,
});
console.log("RPC response:", { data, error });
    if (error) throw new Error(error.message);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function uninstallWidgetAction(params: {
  predefinedId?: string;
  userWidgetId?: string;
}): Promise<{ error?: string }> {
  try {
    const { supabase } = await getAuth();
    const { error } = await supabase.rpc("uninstall_widget", {
      p_predefined_id:  params.predefinedId ?? null,
      p_user_widget_id: params.userWidgetId ?? null,
    });
    if (error) throw new Error(error.message);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function saveWidgetLayouts(
  layouts: Array<{
    instanceId: string;
    layoutLg: WidgetInstance["layoutLg"];
    layoutMd: WidgetInstance["layoutMd"];
    layoutXs: WidgetInstance["layoutXs"];
  }>
): Promise<{ error?: string }> {
  try {
    const { supabase } = await getAuth();
    const payload = layouts.map((l) => ({
      instance_id: l.instanceId,
      layout_lg:   l.layoutLg,
      layout_md:   l.layoutMd,
      layout_xs:   l.layoutXs,
    }));
    const { error } = await supabase.rpc("save_widget_layouts", {
      p_layouts: payload,
    });
    if (error) throw new Error(error.message);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function getWidgetLimits(): Promise<{
  data?: WidgetLimits;
  error?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("get_widget_limits");
    if (error) throw new Error(error.message);
    return { data: data as WidgetLimits };
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function getAppUpdates(): Promise<{
  data?: AppUpdatesType[];
  error?: string;
}> {
  try {
    const { supabase } = await getAuth();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const { data, error } = await supabase
      .from("app_updates")
      .select("*")
      .eq("is_published", true)
      .gte("published_at", oneMonthAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(5);
    if (error) throw new Error(error.message);
    return { data: data ?? [] };
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function getDashboardBatch(): Promise<{
  data?: DashboardData;
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase.rpc("get_user_dashboard", {
      p_user_id: user.id,
    });
    if (error) throw new Error(error.message);
    return { data: data?.[0] as DashboardData };
  } catch (e) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}