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
      avatar_url?: string;
    }) => {
      addLoading();
      setIsPending(true);
      try {
        const res = await updateUserProfileAction(updates);
        if (res.error) return { error: res.error };

        const savedAvatarUrl = res.data?.avatar_url || updates.avatar_url;
        globalUserStore?.getState().updateUser({
          ...updates,
          ...(savedAvatarUrl ? { avatar_url: savedAvatarUrl } : {}),
        });

        if (updates.username) {
          await fetchProfileStats();
        }

        return { error: null };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al actualizar perfil.";
        return { error: message };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading, fetchProfileStats]
  );

  return { updateProfile, isPending };
}
