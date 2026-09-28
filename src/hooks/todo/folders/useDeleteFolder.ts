"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import {
  removeFolderFromIndexedDB,
  saveSingleFolderToIndexedDB,
  saveSidebarToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useDeleteFolder() {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteFolder = async (folder_id: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const prevFolders = store.folders.slice();
    const prevLists = store.lists.slice();
    const deletedFolder = store.folders.find((f) => f.folder_id === folder_id);

    useTodoDataStore.setState((state) => ({
      folders: state.folders.filter((f) => f.folder_id !== folder_id),
      lists: state.lists.map((l) =>
        l.folder === folder_id ? { ...l, folder: null } : l
      ),
    }));

    await removeFolderFromIndexedDB(folder_id);
    const updatedState = useTodoDataStore.getState();
    saveSidebarToIndexedDB(updatedState.lists, updatedState.folders);

    const payload = { folder_id };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueSyncMutation("delete_folder", "folder", payload);
      setIsPending(false);
      return;
    }

    try {
      const result = await deleteFolder(folder_id);

      if (result?.error) {
        if (isNetworkError(result.error)) {
          await enqueueSyncMutation("delete_folder", "folder", payload);
          setIsPending(false);
          return;
        }
        handleError(result.error);
        if (deletedFolder) await saveSingleFolderToIndexedDB(deletedFolder);
        useTodoDataStore.setState({ folders: prevFolders, lists: prevLists });
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("delete_folder", "folder", payload);
        setIsPending(false);
        return;
      }
      handleError(err);
      if (deletedFolder) await saveSingleFolderToIndexedDB(deletedFolder);
      useTodoDataStore.setState({ folders: prevFolders, lists: prevLists });
    }
    
    setIsPending(false);
  };

  return { deleteFolder: handleDeleteFolder, isPending };
}
