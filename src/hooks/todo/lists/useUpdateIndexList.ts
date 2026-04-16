"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateIndexList } from "@/lib/api/list/actions";
import { readFolderMembershipCount, makeMembershipCountPayload, handleError } from "@/store/todoUtils";

export function useUpdateIndexList() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateIndexList = useCallback(async (list_id: string, folder_id: string | null, rank: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const originalList = store.lists.find((list) => list.list_id === list_id);
    if (!originalList) {
      setIsPending(false);
      return;
    }
    const previousFolder = originalList.folder;
    const previousRank = originalList.rank;

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
              ? { ...currentItem, folder: folder_id, rank }
              : currentItem
          ),
        };
      });

      const { error } = await updateIndexList(list_id, folder_id, rank);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      useTodoDataStore.setState((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === list_id
            ? { ...currentItem, folder: previousFolder, rank: previousRank }
            : currentItem
        ),
      }));
      handleError(err);
    }
    
    setIsPending(false);
  }, []);

  return { updateIndexList: handleUpdateIndexList, isPending };
}
