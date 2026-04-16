"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { getLists } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

export function useGetLists() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const fetchLists = useCallback(async () => {
    const initialFetch = useTodoDataStore.getState().initialFetch;
    if (initialFetch) return;

    addLoading();
    setIsPending(true);

    try {
      const { data, error } = await getLists();
      if (error) {
        throw new Error(error);
      }

      useTodoDataStore.setState({
        lists: data?.lists ?? [],
        tasks: data?.tasks ?? [],
        folders: data?.folders ?? [],
        listsPagination: {
          root: { page: 0, hasMore: data?.hasMoreRoot ?? false },
        },
        initialFetch: true,
      });

    } catch (err) {
      handleError(err);
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { fetchLists, isPending };
}
