"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateDataFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import {
  saveSingleFolderToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useUpdateDataFolder() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateDataFolder = async (
    folder_id: string,
    folder_name: string,
    folder_color: string | null
  ) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const prevFolders = store.folders.slice();

    useTodoDataStore.setState((state) => ({
      folders: state.folders.map((folder) =>
        folder.folder_id === folder_id
          ? {
              ...folder,
              folder_name,
              folder_color,
            }
          : folder
      ),
    }));

    const updatedFolder = useTodoDataStore.getState().folders.find((f) => f.folder_id === folder_id);
    if (updatedFolder) {
      await saveSingleFolderToIndexedDB(updatedFolder);
    }

    const payload = {
      folder_id,
      folder_name,
      folder_color,
      folder_description: null,
    };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueSyncMutation("update_folder_data", "folder", payload);
      setIsPending(false);
      return { error: null };
    }

    try {
      const result = await updateDataFolder(folder_id, folder_name, folder_color);

      if (result?.error) {
        if (isNetworkError(result.error)) {
          await enqueueSyncMutation("update_folder_data", "folder", payload);
          setIsPending(false);
          return { error: null };
        }
        handleError(result.error);
        useTodoDataStore.setState({ folders: prevFolders });
        const oldFolder = prevFolders.find((f) => f.folder_id === folder_id);
        if (oldFolder) await saveSingleFolderToIndexedDB(oldFolder);
        setIsPending(false);
        return { error: result.error };
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("update_folder_data", "folder", payload);
        setIsPending(false);
        return { error: null };
      }
      handleError(err);
      useTodoDataStore.setState({ folders: prevFolders });
      const oldFolder = prevFolders.find((f) => f.folder_id === folder_id);
      if (oldFolder) await saveSingleFolderToIndexedDB(oldFolder);
      setIsPending(false);
      return { error: (err as Error).message };
    }

    setIsPending(false);
    return { error: null };
  };

  return { updateDataFolder: handleUpdateDataFolder, isPending };
}
