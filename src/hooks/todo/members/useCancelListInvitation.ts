"use client"

import { useState, useCallback } from "react";
import { cancelListInvitation } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";
import { customToast } from "@/lib/toasts";

export function useCancelListInvitation() {
  const [isPending, setIsPending] = useState(false);

  const handleCancelListInvitation = useCallback(async (invitationId: string) => {
    setIsPending(true);
    try {
      const { error } = await cancelListInvitation(invitationId);
      if (error) throw new Error(error);
      customToast.success("Invitación cancelada.");
      setIsPending(false);
      return {};
    } catch (err) {
      handleError(err);
      setIsPending(false);
      return { error: (err as Error).message };
    }
  }, []);

  return { cancelListInvitation: handleCancelListInvitation, isPending };
}
