"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateIndexFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

export function useUpdateIndexFolders() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateIndexFolders = async (folder_id: string, rank: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const originalFolder = store.folders.find(
      (folder) => folder.folder_id === folder_id
    );
    if (!originalFolder) {
      setIsPending(false);
      return;
    }
    const previousRank = originalFolder.rank;

    try {
      useTodoDataStore.setState((state) => ({
        folders: state.folders.map((currentItem) =>
          currentItem.folder_id === folder_id
            ? { ...currentItem, rank }
            : currentItem
        ),
      }));

      const { error } = await updateIndexFolder(folder_id, rank);

      if (error) {
        throw new Error(error);
      }
    } catch (err) {
      useTodoDataStore.setState((state) => ({
        folders: state.folders.map((currentItem) =>
          currentItem.folder_id === folder_id
            ? { ...currentItem, rank: previousRank }
            : currentItem
        ),
      }));

      handleError(err);
    }
    
    setIsPending(false);
  };

  return { updateIndexFolders: handleUpdateIndexFolders, isPending };
}
