"use client";

import { useState, useCallback } from "react";
import {
  loadDashboardFull,
  getWidgetLimits,
} from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances } from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import { offlineDb } from "@/lib/offline/db";
import {
  WidgetInstance,
  PredefinedWidget,
} from "@/lib/schemas/dashboard.types";

export function useLoadDashboard() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const loadDashboard = useCallback(async () => {
    const isConfigLoaded = useDashboardStore.getState().isConfigLoaded;
    if (isConfigLoaded) return;

    try {
      if (offlineDb?.dashboard) {
        const cached = await offlineDb.dashboard.get("user_dashboard_config");
        if (cached) {
          const cachedCatalog = (
            cached.predefinedWidgets as PredefinedWidget[] ?? []
          ).filter((w) => w.id !== "weather");

          const rawCachedInstances = (
            cached.widgetInstances as WidgetInstance[] ?? []
          ).filter((i) => i.widgetKey !== "weather");

          const instances = rawCachedInstances.map((inst) => {
            if (inst.pwLocalizedName && inst.pwLocalizedDescription) return inst;
            const pw = cachedCatalog.find((p) => p.id === inst.widgetKey);
            if (!pw) return inst;
            return {
              ...inst,
              pwLocalizedName: inst.pwLocalizedName ?? pw.localizedName,
              pwLocalizedDescription:
                inst.pwLocalizedDescription ?? pw.localizedDescription,
            };
          });

          const layout = cached.layout ?? buildLayoutsFromInstances(instances);
          const activeWidgets = instances
            .filter((i) => i.isInstalled)
            .map((i) => i.widgetKey);

          useDashboardStore.setState({
            predefinedWidgets: cachedCatalog,
            widgetInstances: instances,
            widgetLimits: cached.widgetLimits ?? {
              free: 1,
              student: 3,
              pro: 99,
              ultra: 99,
            },
            layout,
            activeWidgets,
            isConfigLoaded: true,
          });
        }
      }
    } catch {
      useDashboardStore.setState({ isConfigLoaded: true });
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      useDashboardStore.setState({ isConfigLoaded: true });
      return;
    }

    addLoading();
    setIsPending(true);

    try {
      const [dashResult, limitsResult] = await Promise.all([
        loadDashboardFull(),
        getWidgetLimits(),
      ]);

      const rawCatalog = dashResult.data?.catalog ?? [];
      const rawInstances = dashResult.data?.instances ?? [];

      const catalog = rawCatalog.filter((w) => w.id !== "weather");
      const filteredInstances = rawInstances.filter(
        (i) => i.widgetKey !== "weather",
      );

      const instances = filteredInstances.map((inst) => {
        if (inst.pwLocalizedName && inst.pwLocalizedDescription) return inst;
        const pw = catalog.find((p) => p.id === inst.widgetKey);
        if (!pw) return inst;
        return {
          ...inst,
          pwLocalizedName: inst.pwLocalizedName ?? pw.localizedName,
          pwLocalizedDescription:
            inst.pwLocalizedDescription ?? pw.localizedDescription,
        };
      });

      const layout = buildLayoutsFromInstances(instances);
      const activeWidgets = instances
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey);
      const widgetLimits = limitsResult.data ?? {
        free: 1,
        student: 3,
        pro: 99,
        ultra: 99,
      };

      useDashboardStore.setState({
        predefinedWidgets: catalog,
        widgetInstances: instances,
        widgetLimits,
        layout,
        activeWidgets,
        isConfigLoaded: true,
      });

      if (offlineDb?.dashboard) {
        await offlineDb.dashboard.put({
          key: "user_dashboard_config",
          widgetInstances: instances,
          layout,
          predefinedWidgets: catalog,
          widgetLimits,
          updatedAt: Date.now(),
        });
      }
    } catch {
      useDashboardStore.setState({ isConfigLoaded: true });
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { loadDashboard, isPending };
}

