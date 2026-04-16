"use client"

import { useState, useCallback } from "react";
import { updateEmbeddedWidget } from "@/lib/api/user-widgets/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useSyncStore } from "@/store/useSyncStore";
import { Json } from "@/lib/schemas/database.types";
import { toast } from "sonner";

export function useUpdateEmbeddedWidget() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);
  const setWidgetInstances = useDashboardStore((s) => s.setWidgetInstances);

  const updateWidget = useCallback(
    async (id: string, payload: { title?: string; url?: string; config?: Json }) => {
      addLoading();
      setIsPending(true);

      try {
        const { data, error } = await updateEmbeddedWidget(id, payload);
        if (error || !data) throw new Error(error ?? "Error desconocido");

        const { widgetInstances } = useDashboardStore.getState();
        const updated = widgetInstances.map((i) =>
          i.widgetKey === id
            ? {
                ...i,
                uwTitle: payload.title !== undefined ? payload.title : i.uwTitle,
                uwUrl:
                  payload.url !== undefined ? (payload.url ?? null) : i.uwUrl,
                uwIsPublic:
                  (payload as any).is_public !== undefined
                    ? (payload as any).is_public
                    : i.uwIsPublic,
              }
            : i
        );
        setWidgetInstances(updated);
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
    [addLoading, removeLoading, setWidgetInstances]
  );

  return { updateWidget, isPending };
}
