"use client"

import { useState, useCallback } from "react";
import { deleteEmbeddedWidget } from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances } from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import { toast } from "sonner";

export function useDeleteEmbeddedWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);
  const setWidgetInstances = useDashboardStore((s) => s.setWidgetInstances);
  const setLayout = useDashboardStore((s) => s.setLayout);
  const setActiveWidgets = useDashboardStore((s) => s.setActiveWidgets);

  const deleteWidget = useCallback(
    async (id: string) => {
      addLoading();
      setIsPending(true);

      try {
        const { error } = await deleteEmbeddedWidget(id);
        if (error) throw new Error(error);

        const { widgetInstances } = useDashboardStore.getState();
        const updated = widgetInstances.map((i) =>
          i.widgetKey === id ? { ...i, isInstalled: false } : i
        );

        setWidgetInstances(updated);
        setLayout(buildLayoutsFromInstances(updated));
        setActiveWidgets(
          updated.filter((i) => i.isInstalled).map((i) => i.widgetKey)
        );

        return { success: true };
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

  return { deleteWidget, isPending };
}
