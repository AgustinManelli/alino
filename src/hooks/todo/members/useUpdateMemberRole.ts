"use client"

import { useState, useCallback } from "react";
import { updateListMemberRole } from "@/lib/api/list/actions";
import { toast } from "sonner";
import { handleError } from "@/store/todoUtils";

export function useUpdateMemberRole() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateMemberRole = useCallback(async (
    listId: string,
    targetUserId: string,
    newRole: "admin" | "editor" | "reader"
  ) => {
    setIsPending(true);
    try {
      const { error } = await updateListMemberRole(listId, targetUserId, newRole);
      if (error) throw new Error(error);
      toast.success("Rol actualizado correctamente.");
      setIsPending(false);
      return {};
    } catch (err) {
      handleError(err);
      setIsPending(false);
      return { error: (err as Error).message };
    }
  }, []);

  return { updateMemberRole: handleUpdateMemberRole, isPending };
}
