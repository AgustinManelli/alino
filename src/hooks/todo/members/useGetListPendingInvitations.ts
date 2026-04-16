"use client"

import { useState, useCallback } from "react";
import { getListPendingInvitations, PendingInvitation } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

export function useGetListPendingInvitations() {
  const [isPending, setIsPending] = useState(false);

  const handleGetListPendingInvitations = useCallback(async (listId: string): Promise<PendingInvitation[]> => {
    setIsPending(true);
    try {
      const res = await getListPendingInvitations(listId);
      console.log('DATOS QUE DEVUELVE LA BD: ', res.data)
      if (res.data) {
        setIsPending(false);
        return res.data;
      }
    } catch (err) {
      handleError(err);
    }
    setIsPending(false);
    return [];
  }, []);

  return { getListPendingInvitations: handleGetListPendingInvitations, isPending };
}
