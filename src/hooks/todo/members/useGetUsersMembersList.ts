"use client"

import { useState, useCallback } from "react";
import { getUsersMembersList } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";
import { UserWithMembershipRole } from "@/lib/schemas/database.types";

export function useGetUsersMembersList() {
  const [isPending, setIsPending] = useState(false);

  const fetchUsersMembersList = useCallback(async (listId: string): Promise<UserWithMembershipRole[]> => {
    setIsPending(true);
    try {
      const res = await getUsersMembersList(listId);
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

  return { getUsersMembersList: fetchUsersMembersList, isPending };
}
