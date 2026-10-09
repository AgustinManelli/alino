"use client";

import { useState, useCallback } from "react";
import { deleteEmbeddedWidget as apiDeleteEmbeddedWidget } from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { buildLayoutsFromInstances } from "@/store/dashboardUtils";
import { useSyncStore } from "@/store/useSyncStore";
import { customToast } from "@/lib/toasts";
import {
  saveDashboardToIndexedDB,
  enqueueDashboardMutation,
} from "@/lib/offline/dashboardSync";
import { isNetworkError } from "@/lib/offline/sidebarSync";

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

      const store = useDashboardStore.getState();
      const updated = store.widgetInstances.map((i) =>
        i.widgetKey === id ? { ...i, isInstalled: false } : i,
      );
      const newLayout = buildLayoutsFromInstances(updated);
      const newActive = updated
        .filter((i) => i.isInstalled)
        .map((i) => i.widgetKey);

      setWidgetInstances(updated);
      setLayout(newLayout);
      setActiveWidgets(newActive);

      await saveDashboardToIndexedDB(
        updated,
        newLayout,
        store.predefinedWidgets,
        store.widgetLimits,
      );

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueDashboardMutation(
          "delete_embedded_widget",
          "user_widget",
          { id },
        );
        setIsPending(false);
        removeLoading();
        return { success: true };
      }

      try {
        const { error } = await apiDeleteEmbeddedWidget(id);
        if (error) throw new Error(error);
        return { success: true };
      } catch (err) {
        if (isNetworkError(err)) {
          await enqueueDashboardMutation(
            "delete_embedded_widget",
            "user_widget",
            { id },
          );
          return { success: true };
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

  return { deleteWidget, isPending };
}
