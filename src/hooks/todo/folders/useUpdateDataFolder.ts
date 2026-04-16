"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateDataFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

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

    const result = await updateDataFolder(folder_id, folder_name, folder_color);

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({ folders: prevFolders });
      setIsPending(false);
      return { error: result.error };
    }

    setIsPending(false);
    return { error: null };
  };

  return { updateDataFolder: handleUpdateDataFolder, isPending };
}
