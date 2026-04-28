"use client"

import { useState, useCallback } from "react";
import { installWidgetAction } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances, getLayoutItemForNewWidget } from "@/store/dashboardUtils";
import { WidgetInstance } from "@/lib/schemas/dashboard.types";
import { useSyncStore } from "@/store/useSyncStore";

export function useInstallWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const installWidget = useCallback(
    async (widgetKey: string, userWidgetId?: string) => {
      addLoading();
      setIsPending(true);

      const store = useDashboardStore.getState();
      const isEmbedded = !!userWidgetId;
      const existing = store.widgetInstances.find((i) => i.widgetKey === widgetKey);

      if (existing) {
        const updated = store.widgetInstances.map((i) =>
          i.widgetKey === widgetKey
            ? {
                ...i,
                isInstalled: true,
                layoutLg: getLayoutItemForNewWidget(widgetKey, "lg", store.predefinedWidgets, store.widgetInstances),
                layoutMd: getLayoutItemForNewWidget(widgetKey, "md", store.predefinedWidgets, store.widgetInstances),
                layoutXs: getLayoutItemForNewWidget(widgetKey, "xs", store.predefinedWidgets, store.widgetInstances),
              }
            : i
        );
        useDashboardStore.setState({
          widgetInstances: updated,
          layout: buildLayoutsFromInstances(updated),
          activeWidgets: updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
        });
      } else {
        const pw = store.predefinedWidgets.find((w) => w.id === widgetKey);
        const newInstance: WidgetInstance = {
          instanceId: "",
          widgetKey,
          widgetSource: isEmbedded ? "embedded" : "predefined",
          componentKey: pw?.componentKey ?? widgetKey,
          pwName: pw?.name ?? null,
          pwDescription: pw?.description ?? null,
          pwCategory: pw?.category ?? null,
          pwTierRequired: pw?.tierRequired ?? null,
          pwIsResizable: pw?.isResizable ?? null,
          pwIsActive: pw?.isActive ?? true,
          uwTitle: null,
          uwUrl: null,
          uwConfig: null,
          uwIsPublic: null,
          uwModerationStatus: null,
          layoutLg: getLayoutItemForNewWidget(widgetKey, "lg", store.predefinedWidgets, store.widgetInstances),
          layoutMd: getLayoutItemForNewWidget(widgetKey, "md", store.predefinedWidgets, store.widgetInstances),
          layoutXs: getLayoutItemForNewWidget(widgetKey, "xs", store.predefinedWidgets, store.widgetInstances),
          isInstalled: true,
        };
        const updated = [...store.widgetInstances, newInstance];
        useDashboardStore.setState({
          widgetInstances: updated,
          layout: buildLayoutsFromInstances(updated),
          activeWidgets: updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
        });
      }

      const instanceForDb = useDashboardStore.getState().widgetInstances.find((i) => i.widgetKey === widgetKey);
      
      const { error, instanceId } = await installWidgetAction({
        predefinedId: isEmbedded ? undefined : widgetKey,
        userWidgetId: isEmbedded ? (userWidgetId as string) : undefined,
        layoutLg: instanceForDb?.layoutLg,
        layoutMd: instanceForDb?.layoutMd,
        layoutXs: instanceForDb?.layoutXs,
      });

      if (error) {
        const reverted = useDashboardStore.getState().widgetInstances.map((i) =>
          i.widgetKey === widgetKey ? { ...i, isInstalled: false } : i
        );
        useDashboardStore.setState({
          widgetInstances: reverted,
          layout: buildLayoutsFromInstances(reverted),
          activeWidgets: reverted.filter((i) => i.isInstalled).map((i) => i.widgetKey),
        });
        setIsPending(false);
        removeLoading();
        return { error };
      }

      if (instanceId) {
        useDashboardStore.setState({
          widgetInstances: useDashboardStore.getState().widgetInstances.map((i) =>
            i.widgetKey === widgetKey ? { ...i, instanceId } : i
          ),
        });
      }
      setIsPending(false);
      removeLoading();
      return {};
    },
    [addLoading, removeLoading]
  );

  return { installWidget, isPending };
}
