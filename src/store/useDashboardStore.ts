"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { Layout, LayoutItem, ResponsiveLayouts } from "react-grid-layout";
import {
  loadDashboardFull,
  installWidgetAction,
  uninstallWidgetAction,
  saveWidgetLayouts,
  getWidgetLimits,
  getAppUpdates,
  getDashboardBatch,
} from "@/lib/api/dashboard/actions";
import {
  AppUpdatesType,
  DashboardData,
  UserWidgetRow,
} from "@/lib/schemas/database.types";
import {
  PredefinedWidget,
  WidgetInstance,
  WidgetLayoutItem,
  WidgetInstanceUpsertPayload,
} from "@/lib/schemas/dashboard.types";
import { WidgetLimits } from "@/lib/schemas/dashboard.types";

type HourlyData = {
  time: string;
  temperature: number;
  weatherCode: number;
  emoji: React.ReactNode;
  isDay: boolean;
};
type WeatherState = {
  temperature: number | null;
  tempMin: number | null;
  tempMax: number | null;
  description: string | null;
  emoji: React.ReactNode | null;
  location: string | null;
  loading: boolean;
  error: string | null;
  weatherType:
    | "sunny"
    | "cloudy-day"
    | "cloudy-night"
    | "rainy"
    | "rainy-day"
    | "rainy-night"
    | "stormy"
    | "snowy"
    | "foggy"
    | "night"
    | "default";
  hourlyForecast: HourlyData[];
};

const TIER_ORDER: Record<string, number> = { free: 0, student: 1, pro: 2 };

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

const packItems = (
  items: LayoutItem[],
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

const getLayoutItemForNewWidget = (
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

const APP_UPDATES_TTL_MS = 60 * 60 * 1000;
let appUpdatesFetchedAt = 0;

type DashboardStore = {
  widgetInstances: WidgetInstance[];
  predefinedWidgets: PredefinedWidget[];
  activeWidgets: string[];
  layout: ResponsiveLayouts;
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  upcoming_tasks: DashboardData["upcoming_tasks"];
  due_today_tasks: DashboardData["due_today_tasks"];
  app_updates: AppUpdatesType[];
  weather: WeatherState;
  isConfigLoaded: boolean;
  isFetchingData: boolean;
  isFetchingAppUpdates: boolean;
  hasFetchedData: boolean;
  hasFetchedAppUpdates: boolean;
  _saveTimeout: ReturnType<typeof setTimeout> | null;
  widgetLimits: WidgetLimits;
  loadDashboard: () => Promise<void>;
  installWidget: (
    widgetKey: string,
    userWidgetId?: string,
  ) => Promise<{ error?: string }>;
  uninstallWidget: (widgetKey: string) => Promise<{ error?: string }>;
  setLayout: (layout: ResponsiveLayouts) => void;
  fetchDashboardData: () => Promise<void>;
  fetchAppUpdates: () => Promise<void>;
  autoSortLayout: () => void;
  addEmbeddedWidgetToStore: (widget: UserWidgetRow) => void;
  updateEmbeddedWidgetInStore: (
    id: string,
    partial: Partial<UserWidgetRow>,
  ) => void;
  removeEmbeddedWidgetFromStore: (id: string) => void;
  setWeather: (data: WeatherState) => void;
  invalidateDashboardData: () => void;
  _scheduleSave: () => void;
};

export const useDashboardStore = create<DashboardStore>()((set, get) => ({
  widgetInstances: [],
  predefinedWidgets: [],
  activeWidgets: [],
  layout: { lg: [], md: [], xs: [] },
  total_tasks: 0,
  pending_tasks: 0,
  completed_tasks: 0,
  overdue_tasks: 0,
  upcoming_tasks: [],
  due_today_tasks: [],
  app_updates: [],
  weather: {
    temperature: null,
    tempMin: null,
    tempMax: null,
    description: null,
    emoji: null,
    location: null,
    loading: true,
    error: null,
    weatherType: "default",
    hourlyForecast: [],
  },
  isConfigLoaded: false,
  isFetchingData: false,
  isFetchingAppUpdates: false,
  hasFetchedData: false,
  hasFetchedAppUpdates: false,
  _saveTimeout: null,
  widgetLimits: { free: 1, student: 3, pro: 99 },

  loadDashboard: async () => {
    if (get().isConfigLoaded) return;
    try {
      const [dashResult, limitsResult] = await Promise.all([
        loadDashboardFull(),
        getWidgetLimits(),
      ]);

      const { catalog = [], instances = [] } = dashResult.data ?? {};
      const layout = buildLayoutsFromInstances(instances);
      const activeWidgets = instances
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey);

      set({
        predefinedWidgets: catalog,
        widgetInstances: instances,
        widgetLimits: limitsResult.data ?? { free: 1, student: 3, pro: 99 },
        layout,
        activeWidgets,
        isConfigLoaded: true,
      });
    } catch (err) {
      console.warn("[DashboardStore] loadDashboard failed:", err);
      set({ isConfigLoaded: true });
    }
  },

  _scheduleSave: () => {
    const existing = get()._saveTimeout;
    if (existing) clearTimeout(existing);
    const timeout = setTimeout(async () => {
      const { widgetInstances } = get();
      const installed = widgetInstances.filter(
        (i) => i.isInstalled && i.instanceId,
      );
      if (installed.length === 0) return;

      const payload = installed.map((inst) => ({
        instanceId: inst.instanceId,
        layoutLg: inst.layoutLg,
        layoutMd: inst.layoutMd,
        layoutXs: inst.layoutXs,
      }));

      const { error } = await saveWidgetLayouts(payload);
      if (error)
        console.warn("[DashboardStore] saveWidgetLayouts failed:", error);
      set({ _saveTimeout: null });
    }, 1500);
    set({ _saveTimeout: timeout });
  },

  installWidget: async (widgetKey, userWidgetId) => {
    const { widgetInstances, predefinedWidgets } = get();
    const isEmbedded = !!userWidgetId;
    const existing = widgetInstances.find((i) => i.widgetKey === widgetKey);

    if (existing) {
      const updated = widgetInstances.map((i) =>
        i.widgetKey === widgetKey
          ? {
              ...i,
              isInstalled: true,
              layoutLg: getLayoutItemForNewWidget(
                widgetKey,
                "lg",
                predefinedWidgets,
                widgetInstances,
              ),
              layoutMd: getLayoutItemForNewWidget(
                widgetKey,
                "md",
                predefinedWidgets,
                widgetInstances,
              ),
              layoutXs: getLayoutItemForNewWidget(
                widgetKey,
                "xs",
                predefinedWidgets,
                widgetInstances,
              ),
            }
          : i,
      );
      set({
        widgetInstances: updated,
        layout: buildLayoutsFromInstances(updated),
        activeWidgets: updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
      });
    } else {
      const pw = predefinedWidgets.find((w) => w.id === widgetKey);
      const newInstance: WidgetInstance = {
        instanceId: "",
        widgetKey,
        widgetSource: isEmbedded ? "embedded" : "predefined",
        pwName: pw?.name ?? null,
        pwDescription: pw?.description ?? null,
        pwCategory: pw?.category ?? null,
        pwTierRequired: pw?.tierRequired ?? null,
        pwIsResizable: pw?.isResizable ?? null,
        uwTitle: null,
        uwUrl: null,
        uwConfig: null,
        uwIsPublic: null,
        uwModerationStatus: null,
        layoutLg: getLayoutItemForNewWidget(widgetKey, "lg", predefinedWidgets, widgetInstances),
        layoutMd: getLayoutItemForNewWidget(widgetKey, "md", predefinedWidgets, widgetInstances),
        layoutXs: getLayoutItemForNewWidget(widgetKey, "xs", predefinedWidgets, widgetInstances),
        isInstalled: true,
      };
      const updated = [...widgetInstances, newInstance];
      set({
        widgetInstances: updated,
        layout: buildLayoutsFromInstances(updated),
        activeWidgets: updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
      });
    }

    const instanceForDb = get().widgetInstances.find((i) => i.widgetKey === widgetKey);
    const { error, instanceId } = await installWidgetAction({
      predefinedId: isEmbedded ? undefined : widgetKey,
      userWidgetId: isEmbedded ? (userWidgetId as string) : undefined,
      layoutLg: instanceForDb?.layoutLg,
      layoutMd: instanceForDb?.layoutMd,
      layoutXs: instanceForDb?.layoutXs,
    });

    if (error) {
      const reverted = get().widgetInstances.map((i) =>
        i.widgetKey === widgetKey ? { ...i, isInstalled: false } : i,
      );
      set({
        widgetInstances: reverted,
        layout: buildLayoutsFromInstances(reverted),
        activeWidgets: reverted.filter((i) => i.isInstalled).map((i) => i.widgetKey),
      });
      return { error };
    }

    if (instanceId) {
      set({
        widgetInstances: get().widgetInstances.map((i) =>
          i.widgetKey === widgetKey ? { ...i, instanceId } : i,
        ),
      });
    }
    return {};
  },

  autoSortLayout: () => {
  const { widgetInstances } = get();
  const newLayouts: ResponsiveLayouts = { lg: [], md: [], xs: [] };

  (["lg", "md", "xs"] as const).forEach((bp) => {
    const cols = bp === "lg" ? 3 : 1;

    const currentItems = widgetInstances
      .filter((i) => i.isInstalled)
      .map((i) => {
        const l =
          bp === "lg" ? i.layoutLg : bp === "md" ? i.layoutMd : i.layoutXs;
        return l ?? { i: i.widgetKey, x: 0, y: 0, w: 1, h: 1 };
      });

    newLayouts[bp] = packItems(currentItems, cols);
  });

  const updated = widgetInstances.map((inst) => {
    if (!inst.isInstalled) return inst;
    const key = inst.widgetKey;
    return {
      ...inst,
      layoutLg:
        (newLayouts.lg?.find((l) => l.i === key) as WidgetLayoutItem) ??
        inst.layoutLg,
      layoutMd:
        (newLayouts.md?.find((l) => l.i === key) as WidgetLayoutItem) ??
        inst.layoutMd,
      layoutXs:
        (newLayouts.xs?.find((l) => l.i === key) as WidgetLayoutItem) ??
        inst.layoutXs,
    };
  });

  set({
    widgetInstances: updated,
    layout: buildLayoutsFromInstances(updated),
  });
  get()._scheduleSave();
},

  uninstallWidget: async (widgetKey) => {
    const { widgetInstances } = get();
    const inst = widgetInstances.find((i) => i.widgetKey === widgetKey);

    const updated = widgetInstances.map((i) =>
      i.widgetKey === widgetKey ? { ...i, isInstalled: false } : i,
    );
    set({
      widgetInstances: updated,
      layout: buildLayoutsFromInstances(updated),
      activeWidgets: updated
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey),
    });

    const { error } = await uninstallWidgetAction({
      predefinedId:
        inst?.widgetSource === "predefined" ? widgetKey : undefined,
      userWidgetId:
        inst?.widgetSource === "embedded"
          ? (widgetKey as unknown as string)
          : undefined,
    });

    if (error) console.warn("[DashboardStore] uninstallWidget failed:", error);
    return {};
  },

  setLayout: (newLayouts: ResponsiveLayouts) => {
    const updated = get().widgetInstances.map((inst) => {
      if (!inst.isInstalled) return inst;
      const key = inst.widgetKey;
      return {
        ...inst,
        layoutLg:
          (newLayouts.lg?.find((l: LayoutItem) => l.i === key) as WidgetLayoutItem) ??
          inst.layoutLg,
        layoutMd:
          (newLayouts.md?.find((l: LayoutItem) => l.i === key) as WidgetLayoutItem) ??
          inst.layoutMd,
        layoutXs:
          (newLayouts.xs?.find((l: LayoutItem) => l.i === key) as WidgetLayoutItem) ??
          inst.layoutXs,
      };
    });
    set({ widgetInstances: updated, layout: newLayouts });
    get()._scheduleSave();
  },

  addEmbeddedWidgetToStore: (widget: UserWidgetRow) => {
    const { widgetInstances } = get();
    const exists = widgetInstances.find((i) => i.widgetKey === widget.id);
    if (exists) {
      const updated = widgetInstances.map((i) =>
        i.widgetKey === widget.id
          ? {
              ...i,
              uwTitle: widget.title,
              uwUrl: widget.url ?? null,
              isInstalled: true,
            }
          : i,
      );
      set({
        widgetInstances: updated,
        layout: buildLayoutsFromInstances(updated),
        activeWidgets: updated
          .filter((i) => i.isInstalled)
          .map((i) => i.widgetKey),
      });
    } else {
      get().installWidget(widget.id, widget.id);
      const patched = get().widgetInstances.map((i) =>
        i.widgetKey === widget.id
          ? {
              ...i,
              uwTitle: widget.title,
              uwUrl: widget.url ?? null,
              uwIsPublic: widget.is_public,
            }
          : i,
      );
      set({ widgetInstances: patched });
    }
  },

  updateEmbeddedWidgetInStore: (id, partial) => {
    const updated = get().widgetInstances.map((i) =>
      i.widgetKey === id
        ? {
            ...i,
            uwTitle: partial.title !== undefined ? partial.title : i.uwTitle,
            uwUrl:
              partial.url !== undefined ? (partial.url ?? null) : i.uwUrl,
            uwIsPublic:
              partial.is_public !== undefined
                ? partial.is_public
                : i.uwIsPublic,
          }
        : i,
    );
    set({ widgetInstances: updated });
  },

  removeEmbeddedWidgetFromStore: (id) => {
    get().uninstallWidget(id);
  },

  fetchDashboardData: async () => {
    if (get().isFetchingData) return;
    set({ isFetchingData: true });
    try {
      const { data, error } = await getDashboardBatch();
      if (error) throw new Error(error);
      if (!data) return;
      set({
        total_tasks: data.total_tasks ?? 0,
        pending_tasks: data.pending_tasks ?? 0,
        completed_tasks: data.completed_tasks ?? 0,
        overdue_tasks: data.overdue_tasks ?? 0,
        upcoming_tasks:
          (data.upcoming_tasks as DashboardData["upcoming_tasks"]) ?? [],
        due_today_tasks:
          (data.due_today_tasks as DashboardData["due_today_tasks"]) ?? [],
        hasFetchedData: true,
      });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      set({ isFetchingData: false });
    }
  },

  fetchAppUpdates: async () => {
    const now = Date.now();
    if (get().isFetchingAppUpdates) return;
    if (
      now - appUpdatesFetchedAt < APP_UPDATES_TTL_MS &&
      get().app_updates.length > 0
    )
      return;
    set({ isFetchingAppUpdates: true });
    try {
      const { data, error } = await getAppUpdates();
      if (error) throw new Error(error);
      set({ app_updates: data ?? [], hasFetchedAppUpdates: true });
      appUpdatesFetchedAt = Date.now();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      set({ isFetchingAppUpdates: false });
    }
  },

  setWeather: (data) => set({ weather: data }),

  invalidateDashboardData: () =>
    set({
      total_tasks: 0,
      pending_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
      upcoming_tasks: [],
      due_today_tasks: [],
      isFetchingData: false,
    }),
}));