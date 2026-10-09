"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { createEmbeddedWidget as apiCreateEmbeddedWidget } from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  buildLayoutsFromInstances,
  getLayoutItemForNewWidget,
} from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import { Json } from "@/lib/schemas/database.types";
import { customToast } from "@/lib/toasts";
import {
  saveDashboardToIndexedDB,
  enqueueDashboardMutation,
} from "@/lib/offline/dashboardSync";
import { isNetworkError } from "@/lib/offline/sidebarSync";
import { WidgetInstance } from "@/lib/schemas/dashboard.types";

export function useCreateEmbeddedWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);
  const setWidgetInstances = useDashboardStore((s) => s.setWidgetInstances);
  const setLayout = useDashboardStore((s) => s.setLayout);
  const setActiveWidgets = useDashboardStore((s) => s.setActiveWidgets);

  const createWidget = useCallback(
    async (payload: { title: string; url: string; config?: Json }) => {
      addLoading();
      setIsPending(true);

      const store = useDashboardStore.getState();
      const { widgetInstances, predefinedWidgets } = store;

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        const localId = uuidv4();
        const newInstance: WidgetInstance = {
          instanceId: "",
          widgetKey: localId,
          widgetSource: "embedded",
          componentKey: null,
          pwName: null,
          pwDescription: null,
          pwCategory: null,
          pwTierRequired: null,
          pwIsResizable: null,
          pwIsActive: true,
          uwTitle: payload.title,
          uwUrl: payload.url,
          uwConfig: (payload.config as Record<string, unknown>) ?? null,
          uwIsPublic: false,
          uwModerationStatus: null,
          layoutLg: getLayoutItemForNewWidget(
            localId,
            "lg",
            predefinedWidgets,
            widgetInstances,
          ),
          layoutMd: getLayoutItemForNewWidget(
            localId,
            "md",
            predefinedWidgets,
            widgetInstances,
          ),
          layoutXs: getLayoutItemForNewWidget(
            localId,
            "xs",
            predefinedWidgets,
            widgetInstances,
          ),
          isInstalled: true,
        };

        const updated = [...widgetInstances, newInstance];
        const newLayout = buildLayoutsFromInstances(updated);

        setWidgetInstances(updated);
        setLayout(newLayout);
        setActiveWidgets(
          updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
        );

        await saveDashboardToIndexedDB(
          updated,
          newLayout,
          predefinedWidgets,
          store.widgetLimits,
        );

        await enqueueDashboardMutation(
          "create_embedded_widget",
          "user_widget",
          {
            id: localId,
            title: payload.title,
            url: payload.url,
            config: payload.config,
          },
        );

        setIsPending(false);
        removeLoading();
        return { data: { id: localId, title: payload.title, url: payload.url } };
      }

      try {
        const { data, error } = await apiCreateEmbeddedWidget(payload);
        if (error || !data) throw new Error(error ?? "Error desconocido");

        const exists = widgetInstances.find((i) => i.widgetKey === data.id);
        let updatedInstances: WidgetInstance[];

        if (exists) {
          updatedInstances = widgetInstances.map((i) =>
            i.widgetKey === data.id
              ? {
                  ...i,
                  uwTitle: data.title,
                  uwUrl: data.url ?? null,
                  isInstalled: true,
                }
              : i,
          );
        } else {
          const newInstance: WidgetInstance = {
            instanceId: "",
            widgetKey: data.id,
            widgetSource: "embedded",
            componentKey: null,
            pwName: null,
            pwDescription: null,
            pwCategory: null,
            pwTierRequired: null,
            pwIsResizable: null,
            pwIsActive: true,
            uwTitle: data.title,
            uwUrl: data.url ?? null,
            uwConfig: null,
            uwIsPublic: data.is_public,
            uwModerationStatus: null,
            layoutLg: getLayoutItemForNewWidget(
              data.id,
              "lg",
              predefinedWidgets,
              widgetInstances,
            ),
            layoutMd: getLayoutItemForNewWidget(
              data.id,
              "md",
              predefinedWidgets,
              widgetInstances,
            ),
            layoutXs: getLayoutItemForNewWidget(
              data.id,
              "xs",
              predefinedWidgets,
              widgetInstances,
            ),
            isInstalled: true,
          };
          updatedInstances = [...widgetInstances, newInstance];
        }

        const newLayout = buildLayoutsFromInstances(updatedInstances);
        setWidgetInstances(updatedInstances);
        setLayout(newLayout);
        setActiveWidgets(
          updatedInstances.filter((i) => i.isInstalled).map((i) => i.widgetKey),
        );

        await saveDashboardToIndexedDB(
          updatedInstances,
          newLayout,
          predefinedWidgets,
          store.widgetLimits,
        );

        return { data };
      } catch (err) {
        if (isNetworkError(err)) {
          const localId = uuidv4();
          const newInstance: WidgetInstance = {
            instanceId: "",
            widgetKey: localId,
            widgetSource: "embedded",
            componentKey: null,
            pwName: null,
            pwDescription: null,
            pwCategory: null,
            pwTierRequired: null,
            pwIsResizable: null,
            pwIsActive: true,
            uwTitle: payload.title,
            uwUrl: payload.url,
            uwConfig: (payload.config as Record<string, unknown>) ?? null,
            uwIsPublic: false,
            uwModerationStatus: null,
            layoutLg: getLayoutItemForNewWidget(
              localId,
              "lg",
              predefinedWidgets,
              widgetInstances,
            ),
            layoutMd: getLayoutItemForNewWidget(
              localId,
              "md",
              predefinedWidgets,
              widgetInstances,
            ),
            layoutXs: getLayoutItemForNewWidget(
              localId,
              "xs",
              predefinedWidgets,
              widgetInstances,
            ),
            isInstalled: true,
          };

          const updated = [...widgetInstances, newInstance];
          const newLayout = buildLayoutsFromInstances(updated);

          setWidgetInstances(updated);
          setLayout(newLayout);
          setActiveWidgets(
            updated.filter((i) => i.isInstalled).map((i) => i.widgetKey),
          );

          await saveDashboardToIndexedDB(
            updated,
            newLayout,
            predefinedWidgets,
            store.widgetLimits,
          );

          await enqueueDashboardMutation(
            "create_embedded_widget",
            "user_widget",
            {
              id: localId,
              title: payload.title,
              url: payload.url,
              config: payload.config,
            },
          );

          return { data: { id: localId, title: payload.title, url: payload.url } };
        }

        const msg = (err as Error).message;
        customToast.error(msg);
        return { error: msg };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading, setWidgetInstances, setLayout, setActiveWidgets],
  );

  return { createWidget, isPending };
}
