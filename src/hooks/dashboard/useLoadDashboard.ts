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
          const instances = (cached.widgetInstances ?? []).filter(
            (i: any) => i.widgetKey !== "weather"
          );
          const layout = cached.layout ?? buildLayoutsFromInstances(instances);
          const activeWidgets = instances
            .filter((i: any) => i.isInstalled)
            .map((i: any) => i.widgetKey);

          useDashboardStore.setState({
            predefinedWidgets: (cached.predefinedWidgets ?? []).filter(
              (w: any) => w.id !== "weather"
            ),
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
    } catch (cacheErr) {
      console.warn("[DashboardStore] Error leyendo cache de Dexie:", cacheErr);
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
      const instances = rawInstances.filter((i) => i.widgetKey !== "weather");

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
    } catch (err) {
      console.warn("[DashboardStore] loadDashboard network failed:", err);
      useDashboardStore.setState({ isConfigLoaded: true });
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { loadDashboard, isPending };
}

