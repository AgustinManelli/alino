"use client";

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updatePinnedFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import {
  saveSingleFolderToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useUpdatePinnedFolder() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdatePinnedFolder = useCallback(async (folder_id: string, pinned: boolean) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const originalFolder = store.folders.find((f) => f.folder_id === folder_id);
    if (!originalFolder) {
      setIsPending(false);
      return;
    }
    const previousPinned = originalFolder.pinned;

    try {
      const now = new Date().toISOString();
      useTodoDataStore.setState((state) => ({
        folders: state.folders.map((f) =>
          f.folder_id === folder_id
            ? { ...f, pinned, updated_at: now, pinned_at: now }
            : f
        ),
      }));

      const updatedFolder = useTodoDataStore.getState().folders.find((f) => f.folder_id === folder_id);
      if (updatedFolder) await saveSingleFolderToIndexedDB(updatedFolder);

      const payload = { folder_id, pinned, rank: originalFolder.rank ?? "" };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueSyncMutation("update_folder_pinned", "folder", payload);
        setIsPending(false);
        return;
      }

      const result = await updatePinnedFolder(folder_id, pinned);
      if (result?.error) {
        if (isNetworkError(result.error)) {
          await enqueueSyncMutation("update_folder_pinned", "folder", payload);
          setIsPending(false);
          return;
        }
        throw new Error(result.error);
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("update_folder_pinned", "folder", { folder_id, pinned, rank: originalFolder.rank ?? "" });
        setIsPending(false);
        return;
      }
      useTodoDataStore.setState((state) => ({
        folders: state.folders.map((f) =>
          f.folder_id === folder_id ? { ...f, pinned: previousPinned } : f
        ),
      }));
      handleError(err);
    }

    setIsPending(false);
  }, []);

  return { updatePinnedFolder: handleUpdatePinnedFolder, isPending };
}
