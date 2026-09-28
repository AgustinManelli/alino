"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateIndexList } from "@/lib/api/list/actions";
import { readFolderMembershipCount, makeMembershipCountPayload, handleError } from "@/store/todoUtils";

import {
  saveSingleListToIndexedDB,
  saveSidebarToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useUpdateIndexList() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateIndexList = useCallback(async (
    list_id: string,
    folder_id: string | null,
    rank: string,
    explicitPreviousFolder?: string | null
  ) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const originalList = store.lists.find((list) => list.list_id === list_id);
    if (!originalList) {
      setIsPending(false);
      return;
    }
    const previousFolder = explicitPreviousFolder !== undefined ? explicitPreviousFolder : originalList.folder;
    const previousRank = originalList.rank;
    const previousPinned = originalList.pinned;

    try {
      useTodoDataStore.setState((state) => {
        const newFolders = state.folders.map((f) => {
          let countChange = 0;
          if (f.folder_id === folder_id && previousFolder !== folder_id)
            countChange++;
          if (f.folder_id === previousFolder && previousFolder !== folder_id)
            countChange--;

          if (countChange !== 0) {
            const currentCount = readFolderMembershipCount(f, state.lists);
            return {
              ...f,
              memberships: makeMembershipCountPayload(
                Math.max(0, currentCount + countChange)
              ),
            };
          }
          return f;
        });

        return {
          folders: newFolders,
          lists: state.lists.map((currentItem) =>
            currentItem.list_id === list_id
              ? {
                  ...currentItem,
                  folder: folder_id,
                  rank,
                  pinned: folder_id !== null ? false : currentItem.pinned,
                }
              : currentItem
          ),
        };
      });

      const updatedState = useTodoDataStore.getState();
      const updatedList = updatedState.lists.find((l) => l.list_id === list_id);
      if (updatedList) {
        await saveSingleListToIndexedDB(updatedList);
      }
      saveSidebarToIndexedDB(updatedState.lists, updatedState.folders);

      const payload = { list_id, folder_id, rank, index: 0 };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueSyncMutation("update_list_index", "list", payload);
        setIsPending(false);
        return;
      }

      const { error } = await updateIndexList(list_id, folder_id, rank);

      if (error) {
        if (isNetworkError(error)) {
          await enqueueSyncMutation("update_list_index", "list", payload);
          setIsPending(false);
          return;
        }
        throw new Error(error);
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("update_list_index", "list", { list_id, folder_id, rank, index: 0 });
        setIsPending(false);
        return;
      }
      useTodoDataStore.setState((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? {
                ...currentItem,
                folder: previousFolder,
                rank: previousRank,
                pinned: previousPinned,
              }
            : currentItem
        ),
      }));
      handleError(err);
    }
    
    setIsPending(false);
  }, []);

  return { updateIndexList: handleUpdateIndexList, isPending };
}
