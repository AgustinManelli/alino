"use client";

import { useState, useCallback } from "react";
import { LayoutItem } from "react-grid-layout";
import { uninstallWidgetAction } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  buildLayoutsFromInstances,
  compactLayout,
} from "@/store/dashboardUtils";
import { useSaveWidgetLayouts } from "@/hooks/dashboard/useSaveWidgetLayouts";
import { useSyncStore } from "@/store/useSyncStore";
import {
  saveDashboardToIndexedDB,
  enqueueDashboardMutation,
} from "@/lib/offline/dashboardSync";
import { isNetworkError } from "@/lib/offline/sidebarSync";

export function useUninstallWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);
  const { scheduleSave } = useSaveWidgetLayouts();

  const uninstallWidget = useCallback(
    async (widgetKey: string) => {
      addLoading();
      setIsPending(true);

      const store = useDashboardStore.getState();
      const inst = store.widgetInstances.find((i) => i.widgetKey === widgetKey);
      const previousInstances = store.widgetInstances;
      const previousLayout = store.layout;
      const previousActiveWidgets = store.activeWidgets;

      const uninstalledInstances = store.widgetInstances.map((i) =>
        i.widgetKey === widgetKey ? { ...i, isInstalled: false } : i,
      );

      const remaining = uninstalledInstances.filter((i) => i.isInstalled);
      const remainingLg = remaining
        .map((i) => i.layoutLg)
        .filter((l): l is LayoutItem => Boolean(l));
      const remainingMd = remaining
        .map((i) => i.layoutMd)
        .filter((l): l is LayoutItem => Boolean(l));
      const remainingXs = remaining
        .map((i) => i.layoutXs)
        .filter((l): l is LayoutItem => Boolean(l));

      const compactedLg = compactLayout(remainingLg, 3);
      const compactedMd = compactLayout(remainingMd, 1);
      const compactedXs = compactLayout(remainingXs, 1);

      const finalInstances = uninstalledInstances.map((instance) => {
        if (!instance.isInstalled) return instance;
        const lg = compactedLg.find((l) => l.i === instance.widgetKey);
        const md = compactedMd.find((l) => l.i === instance.widgetKey);
        const xs = compactedXs.find((l) => l.i === instance.widgetKey);
        return {
          ...instance,
          layoutLg: lg
            ? { i: instance.widgetKey, x: lg.x, y: lg.y, w: lg.w, h: lg.h }
            : instance.layoutLg,
          layoutMd: md
            ? { i: instance.widgetKey, x: md.x, y: md.y, w: md.w, h: md.h }
            : instance.layoutMd,
          layoutXs: xs
            ? { i: instance.widgetKey, x: xs.x, y: xs.y, w: xs.w, h: xs.h }
            : instance.layoutXs,
        };
      });

      const newLayout = buildLayoutsFromInstances(finalInstances);
      const newActiveWidgets = finalInstances
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey);

      useDashboardStore.setState({
        widgetInstances: finalInstances,
        layout: newLayout,
        activeWidgets: newActiveWidgets,
      });

      await saveDashboardToIndexedDB(
        finalInstances,
        newLayout,
        store.predefinedWidgets,
        store.widgetLimits,
      );

      const isEmbedded = inst?.widgetSource === "embedded";
      const mutationPayload = {
        predefinedId: isEmbedded ? undefined : widgetKey,
        userWidgetId: isEmbedded ? widgetKey : undefined,
        widgetKey,
      };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueDashboardMutation(
          "uninstall_widget",
          "widget_instance",
          mutationPayload,
        );
        setIsPending(false);
        removeLoading();
        return {};
      }

      try {
        const { error } = await uninstallWidgetAction({
          predefinedId: isEmbedded ? undefined : widgetKey,
          userWidgetId: isEmbedded ? widgetKey : undefined,
        });

        if (error) {
          if (isNetworkError(error)) {
            await enqueueDashboardMutation(
              "uninstall_widget",
              "widget_instance",
              mutationPayload,
            );
            setIsPending(false);
            removeLoading();
            return {};
          }

          useDashboardStore.setState({
            widgetInstances: previousInstances,
            layout: previousLayout,
            activeWidgets: previousActiveWidgets,
          });
          await saveDashboardToIndexedDB(
            previousInstances,
            previousLayout,
            store.predefinedWidgets,
            store.widgetLimits,
          );
        } else {
          scheduleSave();
        }

        setIsPending(false);
        removeLoading();
        return { error };
      } catch (err) {
        if (isNetworkError(err)) {
          await enqueueDashboardMutation(
            "uninstall_widget",
            "widget_instance",
            mutationPayload,
          );
          setIsPending(false);
          removeLoading();
          return {};
        }

        useDashboardStore.setState({
          widgetInstances: previousInstances,
          layout: previousLayout,
          activeWidgets: previousActiveWidgets,
        });
        await saveDashboardToIndexedDB(
          previousInstances,
          previousLayout,
          store.predefinedWidgets,
          store.widgetLimits,
        );
        setIsPending(false);
        removeLoading();
        return { error: String(err) };
      }
    },
    [addLoading, removeLoading, scheduleSave],
  );

  return { uninstallWidget, isPending };
}
