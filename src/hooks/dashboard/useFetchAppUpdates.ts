"use client"

import { useState, useCallback } from "react";
import { getAppUpdates } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { toast } from "sonner";

const APP_UPDATES_TTL_MS = 60 * 60 * 1000;
let appUpdatesFetchedAt = 0;

export function useFetchAppUpdates() {
  const [isPending, setIsPending] = useState(false);

  const fetchAppUpdates = useCallback(async () => {
    const now = Date.now();
    const store = useDashboardStore.getState();
    if (store.isFetchingAppUpdates) return;
    if (
      now - appUpdatesFetchedAt < APP_UPDATES_TTL_MS &&
      store.app_updates.length > 0
    )
      return;

    useDashboardStore.setState({ isFetchingAppUpdates: true });
    setIsPending(true);

    try {
      const { data, error } = await getAppUpdates();
      if (error) throw new Error(error);

      useDashboardStore.setState({
        app_updates: data ?? [],
        hasFetchedAppUpdates: true,
      });
      appUpdatesFetchedAt = Date.now();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      useDashboardStore.setState({ isFetchingAppUpdates: false });
      setIsPending(false);
    }
  }, []);

  return { fetchAppUpdates, isPending };
}
