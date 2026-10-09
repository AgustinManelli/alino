"use client";

import { useState, useCallback } from "react";
import {
  loadDashboardFull,
  getWidgetLimits,
} from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  buildLayoutsFromInstances,
  isResponsiveLayoutPopulated,
} from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import {
  loadDashboardFromIndexedDB,
  saveDashboardToIndexedDB,
  reconcileDashboardWithOfflineState,
  processDashboardSyncQueue,
  type DashboardOfflineState,
} from "@/lib/offline/dashboardSync";
import {
  WidgetInstance,
  PredefinedWidget,
  WidgetLimits,
} from "@/lib/schemas/dashboard.types";

export function useLoadDashboard() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const loadDashboard = useCallback(async () => {
    const isConfigLoaded = useDashboardStore.getState().isConfigLoaded;
    if (isConfigLoaded) return;

    let localState: DashboardOfflineState | null = null;
    try {
      localState = await loadDashboardFromIndexedDB();
      if (localState && localState.widgetInstances.length > 0) {
        const cachedCatalog = localState.predefinedWidgets.filter(
          (w) => w.id !== "weather",
        );
        const rawCachedInstances = localState.widgetInstances.filter(
          (i) => i.widgetKey !== "weather",
        );

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

        const layout = isResponsiveLayoutPopulated(localState.layout)
          ? localState.layout
          : buildLayoutsFromInstances(instances);
        const activeWidgets = instances
          .filter((i) => i.isInstalled)
          .map((i) => i.widgetKey);

        useDashboardStore.setState({
          predefinedWidgets: cachedCatalog,
          widgetInstances: instances,
          widgetLimits: localState.widgetLimits,
          layout,
          activeWidgets,
          isConfigLoaded: true,
        });
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
      await processDashboardSyncQueue();

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

      const reconciled = await reconcileDashboardWithOfflineState(
        catalog,
        filteredInstances,
        localState,
      );

      const instances = reconciled.instances.map((inst) => {
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

      const layout = isResponsiveLayoutPopulated(reconciled.layout)
        ? reconciled.layout
        : buildLayoutsFromInstances(instances);
      const activeWidgets = instances
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey);
      const widgetLimits: WidgetLimits = limitsResult.data ?? {
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

      await saveDashboardToIndexedDB(instances, layout, catalog, widgetLimits);
    } catch {
      useDashboardStore.setState({ isConfigLoaded: true });
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { loadDashboard, isPending };
}
