"use client"

import { useState, useCallback } from "react";
import { updateUserProfile as updateUserProfileAction } from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { useFetchProfileStats } from "./useFetchProfileStats";

export function useUpdateProfile() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);
  const { fetchProfileStats } = useFetchProfileStats();

  const updateProfile = useCallback(
    async (updates: {
      display_name?: string;
      username?: string;
      biography?: string;
      website_url?: string;
    }) => {
      addLoading();
      setIsPending(true);
      try {
        const res = await updateUserProfileAction(updates);
        if (res.error) return { error: res.error };

        globalUserStore?.getState().updateUser(updates);

        if (updates.username) {
          await fetchProfileStats();
        }

        return { error: null };
      } catch (err: any) {
        return { error: err.message || "Error al actualizar perfil." };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading, fetchProfileStats]
  );

  return { updateProfile, isPending };
}
