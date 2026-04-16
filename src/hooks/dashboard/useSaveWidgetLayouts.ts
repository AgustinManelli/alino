"use client"

import { useState, useCallback } from "react";
import { saveWidgetLayouts } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";

let _saveTimeout: ReturnType<typeof setTimeout> | null = null;

export function useSaveWidgetLayouts() {
  const [isPending, setIsPending] = useState(false);

  const saveLayouts = useCallback(async () => {
    const { widgetInstances } = useDashboardStore.getState();
    const installed = widgetInstances.filter((i) => i.isInstalled && i.instanceId);
    if (installed.length === 0) return;

    const payload = installed.map((inst) => ({
      instanceId: inst.instanceId,
      layoutLg: inst.layoutLg,
      layoutMd: inst.layoutMd,
      layoutXs: inst.layoutXs,
    }));

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
