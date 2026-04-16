"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteAllLists } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

export function useDeleteAllLists() {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteAllLists = useCallback(async () => {
    setIsPending(true);
    const { error } = await deleteAllLists();

    if (error) {
      handleError(error);
      setIsPending(false);
      return;
    }

    useTodoDataStore.setState({ lists: [], tasks: [] });
    setIsPending(false);
  }, []);

  return { deleteAllLists: handleDeleteAllLists, isPending };
}
