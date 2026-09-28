"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateIndexFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import {
  saveSingleFolderToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

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

      const updatedFolder = useTodoDataStore.getState().folders.find((f) => f.folder_id === folder_id);
      if (updatedFolder) await saveSingleFolderToIndexedDB(updatedFolder);

      const payload = { folder_id, rank };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueSyncMutation("update_folder_index", "folder", payload);
        setIsPending(false);
        return;
      }

      const { error } = await updateIndexFolder(folder_id, rank);

      if (error) {
        if (isNetworkError(error)) {
          await enqueueSyncMutation("update_folder_index", "folder", payload);
          setIsPending(false);
          return;
        }
        throw new Error(error);
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("update_folder_index", "folder", { folder_id, rank });
        setIsPending(false);
        return;
      }
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
