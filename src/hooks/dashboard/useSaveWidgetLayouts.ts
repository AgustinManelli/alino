"use client";

import { useState, useCallback } from "react";
import { saveWidgetLayouts } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { offlineDb } from "@/lib/offline/db";
import { WidgetInstance } from "@/lib/schemas/dashboard.types";

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function useSaveWidgetLayouts() {
  const [isPending, setIsPending] = useState(false);

  const saveLayouts = useCallback(async (explicitInstances?: WidgetInstance[]) => {
    if (_saveTimeout) {
      clearTimeout(_saveTimeout);
      _saveTimeout = null;
    }

    const state = useDashboardStore.getState();
    const instances = explicitInstances ?? state.widgetInstances;
    const installed = instances.filter((i) => i.isInstalled && i.instanceId);

    try {
      if (offlineDb?.dashboard) {
        await offlineDb.dashboard.put({
          key: "user_dashboard_config",
          widgetInstances: instances,
          layout: state.layout,
          predefinedWidgets: state.predefinedWidgets,
          widgetLimits: state.widgetLimits,
          updatedAt: Date.now(),
        });
      }
    } catch (cacheErr) {
      console.warn("[DashboardStore] Error guardando layouts en Dexie:", cacheErr);
    }

    if (installed.length === 0) return;

    const payload = installed.map((inst) => ({
      instanceId: inst.instanceId,
      layoutLg: inst.layoutLg,
      layoutMd: inst.layoutMd,
      layoutXs: inst.layoutXs,
    }));

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      return;
    }

    setIsPending(true);
    try {
      const { error } = await saveWidgetLayouts(payload);
      if (error) console.warn("[DashboardStore] saveWidgetLayouts failed:", error);
    } finally {
      setIsPending(false);
    }
  }, []);

  const scheduleSave = useCallback(() => {
    if (_saveTimeout) clearTimeout(_saveTimeout);

    _saveTimeout = setTimeout(() => {
      saveLayouts();
      _saveTimeout = null;
    }, 1500);
  }, [saveLayouts]);

  return { saveLayouts, scheduleSave, isPending };
}

