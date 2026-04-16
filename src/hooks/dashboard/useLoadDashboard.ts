"use client"

import { useState, useCallback } from "react";
import { loadDashboardFull, getWidgetLimits } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances } from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";

export function useLoadDashboard() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const loadDashboard = useCallback(async () => {
    const isConfigLoaded = useDashboardStore.getState().isConfigLoaded;
    if (isConfigLoaded) return;

    addLoading();
    setIsPending(true);

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

      useDashboardStore.setState({
        predefinedWidgets: catalog,
        widgetInstances: instances,
        widgetLimits: limitsResult.data ?? { free: 1, student: 3, pro: 99, ultra: 99 },
        layout,
        activeWidgets,
        isConfigLoaded: true,
      });
    } catch (err) {
      console.warn("[DashboardStore] loadDashboard failed:", err);
      useDashboardStore.setState({ isConfigLoaded: true });
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { loadDashboard, isPending };
}
