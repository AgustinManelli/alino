"use client"

import { useState, useCallback } from "react";
import { setUsernameFirstTime as setUsernameFirstTimeAction } from "@/lib/api/user/actions";
import { globalUserStore } from "@/store/useUserDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { toast } from "sonner";

export function useSetUsernameFirstTime() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const setUsernameFirstTime = useCallback(
    async (username: string) => {
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

        const store = globalUserStore?.getState();
        if (store?.user) {
          store.updateUser({
            username,
            user_private: store.user.user_private
              ? {
                  ...store.user.user_private,
                  initial_username_prompt_shown: false,
                }
              : null,
          });
        }
        return { error: null };
      } catch (err) {
        toast.error((err as Error).message || "Error desconocido");
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
