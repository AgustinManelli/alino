"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { getLists } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import {
  saveSidebarToIndexedDB,
  loadSidebarFromIndexedDB,
  reconcileWithOfflineState,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useGetLists() {
  const [isPending, setIsPending] = useState(false);
  const addLoading = useSyncStore((state) => state.addLoading);
  const removeLoading = useSyncStore((state) => state.removeLoading);

  const fetchLists = useCallback(async (force: boolean = false) => {
    const initialFetch = useTodoDataStore.getState().initialFetch;
    if (initialFetch && !force) return;

    addLoading();
    setIsPending(true);

    try {
      const { data, error } = await getLists();
      if (error) {
        throw new Error(error);
      }

      const rawLists = data?.lists ?? [];
      const rawFolders = data?.folders ?? [];
      const rawTasks = data?.tasks ?? [];

      const reconciled = await reconcileWithOfflineState(
        rawLists,
        rawFolders,
        rawTasks
      );

      useTodoDataStore.setState({
        lists: reconciled.lists,
        tasks: reconciled.tasks,
        folders: reconciled.folders,
        listsPagination: {
          root: { page: 0, hasMore: data?.hasMoreRoot ?? false },
        },
        initialFetch: true,
      });

      saveSidebarToIndexedDB(reconciled.lists, reconciled.folders, reconciled.tasks);

    } catch (err) {
      if (isNetworkError(err)) {
        const local = await loadSidebarFromIndexedDB();
        if (local.lists.length > 0 || local.folders.length > 0 || local.tasks.length > 0) {
          useTodoDataStore.setState({
            lists: local.lists,
            folders: local.folders,
            tasks: local.tasks ?? [],
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
