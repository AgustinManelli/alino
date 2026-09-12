"use client";

import { useState, useCallback } from "react";
import {
  setUsernameFirstTime as setUsernameFirstTimeAction,
  updateUserProfile as updateUserProfileAction,
} from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { customToast } from "@/lib/toasts";

export function useSetUsernameFirstTime() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const setUsernameFirstTime = useCallback(
    async (username: string, avatarUrl?: string | null) => {
      addLoading();
      setIsPending(true);
      try {
        const res = await setUsernameFirstTimeAction(username);
        if (res.error) {
          if (res.error === "USERNAME_TAKEN") {
            return { error: "Ese nombre de usuario ya está en uso." };
          }
          return { error: res.error };
        }

        let effectiveAvatarUrl = avatarUrl;
        if (avatarUrl !== undefined) {
          const updateRes = await updateUserProfileAction({
            avatar_url: avatarUrl || "",
          });
          if (updateRes.error) {
            return { error: updateRes.error };
          }
          if (updateRes.data?.avatar_url) {
            effectiveAvatarUrl = updateRes.data.avatar_url;
          }
        }

        const store = globalUserStore?.getState();
        if (store?.user) {
          store.updateUser({
            username,
            ...(effectiveAvatarUrl !== undefined ? { avatar_url: effectiveAvatarUrl } : {}),
            user_private: store.user.user_private
              ? {
                  ...store.user.user_private,
                  initial_username_prompt_shown: false,
                }
              : null,
          });
        }
        return { error: null };
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Error desconocido";
        customToast.error(msg);
        return { error: "Error desconocido." };
      } finally {
        setIsPending(false);
        removeLoading();
      }
    },
    [addLoading, removeLoading]
  );

  return { setUsernameFirstTime, isPending };
}
