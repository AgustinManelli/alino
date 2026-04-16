"use client"

import { useState, useCallback } from "react";
import { getFeatureUsageAction } from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import { AI_FEATURE_KEY } from "@/lib/ai/creditCosts";
import { useSyncStore } from "@/store/useSyncStore";
import { handleError } from "@/store/todoUtils";

export function useFetchAIUsage() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const fetchAIUsage = useCallback(async () => {
    addLoading();
    setIsPending(true);
    try {
      const res = await getFeatureUsageAction(AI_FEATURE_KEY);
      if (res.data) {
        globalUserStore?.getState().setAIUsage(res.data);
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { fetchAIUsage, isPending };
}
