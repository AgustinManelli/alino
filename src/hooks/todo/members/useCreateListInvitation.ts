"use client"

import { useState, useCallback } from "react";
import { createListInvitation } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";
import { customToast } from "@/lib/toasts";

export function useCreateListInvitation() {
  const [isPending, setIsPending] = useState(false);

  const handleCreateListInvitation = useCallback(async (
    list_id: string,
    invited_user_username: string
  ) => {
    setIsPending(true);
    try {
      const { error } = await createListInvitation(
        list_id,
        invited_user_username
      );
      if (error) {
        throw new Error(error);
      }
      customToast.success(`${invited_user_username} fue invitado correctamente.`);
      setIsPending(false);
      return { error: null };
    } catch (err) {
      handleError(err);
      setIsPending(false);
      return { error: (err as Error).message || "Error desconocido" };
    }
  }, []);

  return { createListInvitation: handleCreateListInvitation, isPending };
}
