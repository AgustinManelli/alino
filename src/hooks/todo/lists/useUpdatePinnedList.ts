"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { getNextRankForUser, updatePinnedList } from "@/lib/api/list/actions";
import { readFolderMembershipCount, makeMembershipCountPayload, calculateNewIndex, handleError } from "@/store/todoUtils";

export function useUpdatePinnedList() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdatePinnedList = useCallback(async (list_id: string, pinned: boolean) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const originalList = store.lists.find((list) => list.list_id === list_id);
    if (!originalList) {
      setIsPending(false);
      return;
    }
    const previousPinned = originalList.pinned;
    const previousFolder = originalList.folder;
    const previousRank = originalList.rank;
    let errorResult: string | undefined;

    try {
      if (pinned === true) {
        useTodoDataStore.setState((state) => {
          let updatedFolders = state.folders;
          if (previousFolder) {
            updatedFolders = state.folders.map((f) => {
              if (f.folder_id === previousFolder) {
                const currentCount = readFolderMembershipCount(f, state.lists);
                return {
                  ...f,
                  memberships: makeMembershipCountPayload(
                    Math.max(0, currentCount - 1)
                  ),
                };
              }
              return f;
            });
          }

          return {
            folders: updatedFolders,
            lists: state.lists.map((currentItem) =>
              currentItem.list_id === list_id
                ? { ...currentItem, pinned, folder: null }
                : currentItem
            ),
          };
        });
        const result = await updatePinnedList(list_id, pinned, null);
        errorResult = result?.error;
      } else {
        const lists = store.lists;
        const folders = store.folders;
        const index = calculateNewIndex(lists, folders);

        const { rank: serverRank } = await getNextRankForUser();
        const newRank = serverRank ?? previousRank ?? undefined;

        useTodoDataStore.setState((state) => ({
          lists: state.lists.map((currentItem) =>
            currentItem.list_id === list_id
              ? { ...currentItem, pinned, index, rank: newRank ?? currentItem.rank }
              : currentItem
          ),
        }));

        const result = await updatePinnedList(list_id, pinned, index, newRank);
        errorResult = result?.error;
      }

      if (errorResult) {
        throw new Error(errorResult);
      }
    } catch (err) {
      useTodoDataStore.setState((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, pinned: previousPinned, folder: previousFolder, rank: previousRank }
            : currentItem
        ),
      }));
      handleError(err);
    }
    
    setIsPending(false);
  }, []);

  return { updatePinnedList: handleUpdatePinnedList, isPending };
}
