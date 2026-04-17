"use client"

import { useState, useCallback } from "react";
import { getDashboardBatch } from "@/lib/api/dashboard/actions";
import { useDashboardStore } from "@/store/useDashboardStore";
import { DashboardData } from "@/lib/schemas/database.types";
import { useSyncStore } from "@/store/useSyncStore";
import { customToast } from "@/lib/toasts";

export function useFetchDashboardData() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const fetchDashboardData = useCallback(async () => {
    const isFetchingData = useDashboardStore.getState().isFetchingData;
    if (isFetchingData) return;

    useDashboardStore.setState({ isFetchingData: true });
    addLoading();
    setIsPending(true);

    try {
      const { data, error } = await getDashboardBatch();
      if (error) throw new Error(error);
      if (!data) return;

      useDashboardStore.setState({
        total_tasks: data.total_tasks ?? 0,
        pending_tasks: data.pending_tasks ?? 0,
        completed_tasks: data.completed_tasks ?? 0,
        overdue_tasks: data.overdue_tasks ?? 0,
        upcoming_tasks:
          (data.upcoming_tasks as DashboardData["upcoming_tasks"]) ?? [],
        due_today_tasks:
          (data.due_today_tasks as DashboardData["due_today_tasks"]) ?? [],
        hasFetchedData: true,
      });
    } catch (err) {
      customToast.error(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      useDashboardStore.setState({ isFetchingData: false });
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { fetchDashboardData, isPending };
}
