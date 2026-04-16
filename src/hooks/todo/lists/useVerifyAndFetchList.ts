"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { ListsType } from "@/lib/schemas/database.types";

export function useVerifyAndFetchList() {
  const [isPending, setIsPending] = useState(false);

  const verifyAndFetchList = useCallback(async (listId: string) => {
    setIsPending(true);
    const state = useTodoDataStore.getState();
    if (state.lists.some((l) => l.list_id === listId)) {
      setIsPending(false);
      return true;
    }

    try {
      const { getSingleListsAsMembership } = await import(
        "@/lib/api/list/actions"
      );
      const result = await getSingleListsAsMembership(listId);

      if (result?.data) {
        useTodoDataStore.setState((s) => ({
          lists: [...s.lists, result.data as ListsType],
        }));
        setIsPending(false);
        return true;
      }
      setIsPending(false);
      return false;
    } catch (err) {
      console.error("Error verifying list:", err);
      setIsPending(false);
      return false;
    }
  }, []);

  return { verifyAndFetchList, isPending };
}
