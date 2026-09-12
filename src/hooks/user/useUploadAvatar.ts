"use client"

import { useState, useCallback } from "react";
import { uploadAvatarAction } from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import { useSyncStore } from "@/store/useSyncStore";

export function useUploadAvatar() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const uploadAvatar = useCallback(
    async (formData: FormData) => {
      addLoading();
      setIsPending(true);
      try {
        const res = await uploadAvatarAction(formData);
        if (res.error) return { error: res.error };

        if (res.data) {
          globalUserStore?.getState().updateUser({ avatar_url: res.data.avatar_url });
        }

        return { error: null, data: res.data };
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Error al subir avatar.";
        return { error: message };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading]
  );

  return { uploadAvatar, isPending };
}
