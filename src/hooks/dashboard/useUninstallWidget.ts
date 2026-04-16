"use client"

import { useState, useCallback } from "react";
import { uninstallWidgetAction } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances } from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";

export function useUninstallWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const uninstallWidget = useCallback(
    async (widgetKey: string) => {
      addLoading();
      setIsPending(true);

      const store = useDashboardStore.getState();
      const inst = store.widgetInstances.find((i) => i.widgetKey === widgetKey);

      const updated = store.widgetInstances.map((i) =>
        i.widgetKey === widgetKey ? { ...i, isInstalled: false } : i
      );
      useDashboardStore.setState({
        widgetInstances: updated,
        layout: buildLayoutsFromInstances(updated),
        activeWidgets: updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
      });

      const { error } = await uninstallWidgetAction({
        predefinedId: inst?.widgetSource === "predefined" ? widgetKey : undefined,
        userWidgetId: inst?.widgetSource === "embedded" ? (widgetKey as unknown as string) : undefined,
      });

      if (error) console.warn("[DashboardStore] uninstallWidget failed:", error);
      
      setIsPending(false);
      removeLoading();
      return { error };
    },
    [addLoading, removeLoading]
  );

  return { uninstallWidget, isPending };
}
