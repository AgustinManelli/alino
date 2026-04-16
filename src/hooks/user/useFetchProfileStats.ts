"use client"

import { useState, useCallback } from "react";
import { getUserProfileStats as getUserProfileStatsAction } from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { handleError } from "@/store/todoUtils";

export function useFetchProfileStats() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const fetchProfileStats = useCallback(async () => {
    addLoading();
    setIsPending(true);
    try {
      const res = await getUserProfileStatsAction();
      if (res.data) {
        globalUserStore?.getState().setProfileStats(res.data);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { fetchProfileStats, isPending };
}
