"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { installWidgetAction } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  buildLayoutsFromInstances,
  getLayoutItemForNewWidget,
} from "@/store/dashboardUtils";
import { WidgetInstance } from "@/lib/schemas/dashboard.types";
import { useSyncStore } from "@/store/useSyncStore";
import {
  saveDashboardToIndexedDB,
  enqueueDashboardMutation,
} from "@/lib/offline/dashboardSync";
import { isNetworkError } from "@/lib/offline/sidebarSync";

export function useInstallWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const installWidget = useCallback(
    async (widgetKey: string, userWidgetId?: string) => {
      addLoading();
      setIsPending(true);

      const store = useDashboardStore.getState();
      const isEmbedded = Boolean(userWidgetId);
      const existing = store.widgetInstances.find(
        (i) => i.widgetKey === widgetKey,
      );

      const layoutLg = getLayoutItemForNewWidget(
        widgetKey,
        "lg",
        store.predefinedWidgets,
        store.widgetInstances,
      );
      const layoutMd = getLayoutItemForNewWidget(
        widgetKey,
        "md",
        store.predefinedWidgets,
        store.widgetInstances,
      );
      const layoutXs = getLayoutItemForNewWidget(
        widgetKey,
        "xs",
        store.predefinedWidgets,
        store.widgetInstances,
      );

      let updated: WidgetInstance[];

      if (existing) {
        updated = store.widgetInstances.map((i) =>
          i.widgetKey === widgetKey
            ? {
                ...i,
                isInstalled: true,
                layoutLg,
                layoutMd,
                layoutXs,
              }
            : i,
        );
      } else {
        const pw = store.predefinedWidgets.find((w) => w.id === widgetKey);
        const newInstance: WidgetInstance = {
          instanceId: uuidv4(),
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
          layoutLg,
          layoutMd,
          layoutXs,
          isInstalled: true,
        };
        updated = [...store.widgetInstances, newInstance];
      }

      const newLayout = buildLayoutsFromInstances(updated);
      const activeWidgets = updated
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey);

      useDashboardStore.setState({
        widgetInstances: updated,
        layout: newLayout,
        activeWidgets,
      });

      await saveDashboardToIndexedDB(
        updated,
        newLayout,
        store.predefinedWidgets,
        store.widgetLimits,
      );

      const instanceForDb = updated.find((i) => i.widgetKey === widgetKey);

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueDashboardMutation("install_widget", "widget_instance", {
          predefinedId: isEmbedded ? undefined : widgetKey,
          userWidgetId: isEmbedded ? userWidgetId : undefined,
          layoutLg: instanceForDb?.layoutLg,
          layoutMd: instanceForDb?.layoutMd,
          layoutXs: instanceForDb?.layoutXs,
          widgetKey,
        });
        setIsPending(false);
        removeLoading();
        return {};
      }

      try {
        const { error, instanceId } = await installWidgetAction({
          predefinedId: isEmbedded ? undefined : widgetKey,
          userWidgetId: isEmbedded ? userWidgetId : undefined,
          layoutLg: instanceForDb?.layoutLg,
          layoutMd: instanceForDb?.layoutMd,
          layoutXs: instanceForDb?.layoutXs,
        });

        if (error) {
          if (isNetworkError(error)) {
            await enqueueDashboardMutation("install_widget", "widget_instance", {
              predefinedId: isEmbedded ? undefined : widgetKey,
              userWidgetId: isEmbedded ? userWidgetId : undefined,
              layoutLg: instanceForDb?.layoutLg,
              layoutMd: instanceForDb?.layoutMd,
              layoutXs: instanceForDb?.layoutXs,
              widgetKey,
            });
            setIsPending(false);
            removeLoading();
            return {};
          }

          const reverted = useDashboardStore
            .getState()
            .widgetInstances.map((i) =>
              i.widgetKey === widgetKey ? { ...i, isInstalled: false } : i,
            );
          const revertedLayout = buildLayoutsFromInstances(reverted);
          useDashboardStore.setState({
            widgetInstances: reverted,
            layout: revertedLayout,
            activeWidgets: reverted
              .filter((i) => i.isInstalled)
              .map((i) => i.widgetKey),
          });
          await saveDashboardToIndexedDB(
            reverted,
            revertedLayout,
            store.predefinedWidgets,
            store.widgetLimits,
          );
          setIsPending(false);
          removeLoading();
          return { error };
        }

        if (instanceId) {
          const synced = useDashboardStore
            .getState()
            .widgetInstances.map((i) =>
              i.widgetKey === widgetKey ? { ...i, instanceId } : i,
            );
          useDashboardStore.setState({ widgetInstances: synced });
          await saveDashboardToIndexedDB(
            synced,
            newLayout,
            store.predefinedWidgets,
            store.widgetLimits,
          );
        }

        setIsPending(false);
        removeLoading();
        return {};
      } catch (err) {
        if (isNetworkError(err)) {
          await enqueueDashboardMutation("install_widget", "widget_instance", {
            predefinedId: isEmbedded ? undefined : widgetKey,
            userWidgetId: isEmbedded ? userWidgetId : undefined,
            layoutLg: instanceForDb?.layoutLg,
            layoutMd: instanceForDb?.layoutMd,
            layoutXs: instanceForDb?.layoutXs,
            widgetKey,
          });
          setIsPending(false);
          removeLoading();
          return {};
        }

        setIsPending(false);
        removeLoading();
        return { error: String(err) };
      }
    },
    [addLoading, removeLoading],
  );

  return { installWidget, isPending };
}
