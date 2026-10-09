"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { saveWidgetLayouts as apiSaveWidgetLayouts } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import {
  saveDashboardToIndexedDB,
  enqueueDashboardMutation,
} from "@/lib/offline/dashboardSync";
import { WidgetInstance } from "@/lib/schemas/dashboard.types";

export function useSaveWidgetLayouts() {
  const [isPending, setIsPending] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveLayouts = useCallback(
    async (explicitInstances?: WidgetInstance[]) => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }

      const state = useDashboardStore.getState();
      const instances = explicitInstances ?? state.widgetInstances;
      const installed = instances.filter((i) => i.isInstalled && i.instanceId);

      await saveDashboardToIndexedDB(
        instances,
        state.layout,
        state.predefinedWidgets,
        state.widgetLimits,
      );

      if (installed.length === 0) return;

      const payload = installed.map((inst) => ({
        instanceId: inst.instanceId,
        layoutLg: inst.layoutLg,
        layoutMd: inst.layoutMd,
        layoutXs: inst.layoutXs,
      }));

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueDashboardMutation("save_layouts", "widget_layout", {
          layouts: payload,
        });
        return;
      }

      setIsPending(true);
      try {
        const { error } = await apiSaveWidgetLayouts(payload);
        if (error) {
          await enqueueDashboardMutation("save_layouts", "widget_layout", {
            layouts: payload,
          });
        }
      } catch {
        await enqueueDashboardMutation("save_layouts", "widget_layout", {
          layouts: payload,
        });
      } finally {
        setIsPending(false);
      }
    },
    [],
  );

  const scheduleSave = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      saveLayouts();
      saveTimeoutRef.current = null;
    }, 1500);
  }, [saveLayouts]);

  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
        saveTimeoutRef.current = null;
      }
    };
  }, []);

  return { saveLayouts, scheduleSave, isPending };
}
