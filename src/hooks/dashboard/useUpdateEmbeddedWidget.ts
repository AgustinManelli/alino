"use client";

import { useState, useCallback } from "react";
import { updateEmbeddedWidget as apiUpdateEmbeddedWidget } from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSyncStore } from "@/store/useSyncStore";
import { Json } from "@/lib/schemas/database.types";
import { customToast } from "@/lib/toasts";
import {
  saveDashboardToIndexedDB,
  enqueueDashboardMutation,
} from "@/lib/offline/dashboardSync";
import { isNetworkError } from "@/lib/offline/sidebarSync";

export function useUpdateEmbeddedWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);
  const setWidgetInstances = useDashboardStore((s) => s.setWidgetInstances);

  const updateWidget = useCallback(
    async (
      id: string,
      payload: { title?: string; url?: string; config?: Json; is_public?: boolean },
    ) => {
      addLoading();
      setIsPending(true);

      const store = useDashboardStore.getState();
      const updated = store.widgetInstances.map((i) =>
        i.widgetKey === id
          ? {
              ...i,
              uwTitle: payload.title !== undefined ? payload.title : i.uwTitle,
              uwUrl: payload.url !== undefined ? payload.url : i.uwUrl,
              uwIsPublic:
                payload.is_public !== undefined
                  ? payload.is_public
                  : i.uwIsPublic,
            }
          : i,
      );
      setWidgetInstances(updated);
      await saveDashboardToIndexedDB(
        updated,
        store.layout,
        store.predefinedWidgets,
        store.widgetLimits,
      );

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueDashboardMutation(
          "update_embedded_widget",
          "user_widget",
          { id, ...payload },
        );
        setIsPending(false);
        removeLoading();
        return { data: { id, ...payload } };
      }

      try {
        const { data, error } = await apiUpdateEmbeddedWidget(id, payload);
        if (error || !data) throw new Error(error ?? "Error desconocido");
        return { data };
      } catch (err) {
        if (isNetworkError(err)) {
          await enqueueDashboardMutation(
            "update_embedded_widget",
            "user_widget",
            { id, ...payload },
          );
          return { data: { id, ...payload } };
        }

        const msg = (err as Error).message;
        customToast.error(msg);
        return { error: msg };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading, setWidgetInstances],
  );

  return { updateWidget, isPending };
}
