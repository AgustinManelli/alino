"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteFolder } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

export function useDeleteFolder() {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteFolder = async (folder_id: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const prevFolders = store.folders.slice();
    const prevLists = store.lists.slice();

    useTodoDataStore.setState((state) => ({
      folders: state.folders.filter((f) => f.folder_id !== folder_id),
      lists: state.lists.map((l) =>
        l.folder === folder_id ? { ...l, folder: null } : l
      ),
    }));

    const result = await deleteFolder(folder_id);

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({ folders: prevFolders, lists: prevLists });
    }
    
    setIsPending(false);
  };

  return { deleteFolder: handleDeleteFolder, isPending };
}
