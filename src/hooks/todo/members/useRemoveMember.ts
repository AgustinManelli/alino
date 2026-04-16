"use client"

import { useState, useCallback } from "react";
import { removeListMember } from "@/lib/api/list/actions";
import { toast } from "sonner";
import { handleError } from "@/store/todoUtils";

export function useRemoveMember() {
  const [isPending, setIsPending] = useState(false);

  const handleRemoveMember = useCallback(async (listId: string, targetUserId: string) => {
    setIsPending(true);
    try {
      const { error } = await removeListMember(listId, targetUserId);
      if (error) throw new Error(error);
      toast.success("Miembro eliminado de la lista.");
      setIsPending(false);
      return {};
    } catch (err) {
      handleError(err);
      setIsPending(false);
      return { error: (err as Error).message };
    }
  }, []);

  return { removeMember: handleRemoveMember, isPending };
}
