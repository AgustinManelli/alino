"use client"

import { useState, useCallback } from "react";
import { createEmbeddedWidget } from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances, getLayoutItemForNewWidget } from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import { Json } from "@/lib/schemas/database.types";
import { toast } from "sonner";

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

      try {
        const { data, error } = await createEmbeddedWidget(payload);
        if (error || !data) throw new Error(error ?? "Error desconocido");

        const store = useDashboardStore.getState();
        const { widgetInstances, predefinedWidgets } = store;

        const exists = widgetInstances.find((i) => i.widgetKey === data.id);
        let updatedInstances;

        if (exists) {
          updatedInstances = widgetInstances.map((i) =>
            i.widgetKey === data.id
              ? {
                  ...i,
                  uwTitle: data.title,
                  uwUrl: data.url ?? null,
                  isInstalled: true,
                }
              : i
          );
        } else {
          const newInstance = {
            instanceId: "",
            widgetKey: data.id,
            widgetSource: "embedded" as const,
            pwName: null,
            pwDescription: null,
            pwCategory: null,
            pwTierRequired: null,
            pwIsResizable: null,
            uwTitle: data.title,
            uwUrl: data.url ?? null,
            uwConfig: null,
            uwIsPublic: data.is_public,
            uwModerationStatus: null,
            layoutLg: getLayoutItemForNewWidget(data.id, "lg", predefinedWidgets, widgetInstances),
            layoutMd: getLayoutItemForNewWidget(data.id, "md", predefinedWidgets, widgetInstances),
            layoutXs: getLayoutItemForNewWidget(data.id, "xs", predefinedWidgets, widgetInstances),
            isInstalled: true,
          };
          updatedInstances = [...widgetInstances, newInstance];
        }

        setWidgetInstances(updatedInstances);
        setLayout(buildLayoutsFromInstances(updatedInstances));
        setActiveWidgets(
          updatedInstances.filter((i) => i.isInstalled).map((i) => i.widgetKey)
        );

        return { data };
      } catch (err) {
        const msg = (err as Error).message;
        toast.error(msg);
        return { error: msg };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading, setWidgetInstances, setLayout, setActiveWidgets]
  );

  return { createWidget, isPending };
}
