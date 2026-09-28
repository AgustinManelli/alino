"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { getLists } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import { saveSidebarToIndexedDB, loadSidebarFromIndexedDB, isNetworkError } from "@/lib/offline/sidebarSync";

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

      const lists = data?.lists ?? [];
      const folders = data?.folders ?? [];

      useTodoDataStore.setState({
        lists,
        tasks: data?.tasks ?? [],
        folders,
        listsPagination: {
          root: { page: 0, hasMore: data?.hasMoreRoot ?? false },
        },
        initialFetch: true,
      });

      saveSidebarToIndexedDB(lists, folders);
    } catch (err) {
      if (isNetworkError(err)) {
        const local = await loadSidebarFromIndexedDB();
        if (local.lists.length > 0 || local.folders.length > 0) {
          useTodoDataStore.setState({
            lists: local.lists,
            folders: local.folders,
            tasks: [],
            listsPagination: {
              root: { page: 0, hasMore: false },
            },
            initialFetch: true,
          });
          return;
        }
      }
      handleError(err);
    } finally {
      setIsPending(false);
      removeLoading();
    }
  }, [addLoading, removeLoading]);

  return { fetchLists, isPending };
}
