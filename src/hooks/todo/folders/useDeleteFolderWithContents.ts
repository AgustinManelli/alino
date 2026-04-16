"use client"

import { useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteFolderWithContents } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

export function useDeleteFolderWithContents() {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteFolderWithContents = async (folder_id: string) => {
    setIsPending(true);
    const state = useTodoDataStore.getState();
    const listIdsInFolder = state.lists
      .filter((l) => l.folder === folder_id)
      .map((l) => l.list_id);

    const prevFolders = state.folders.slice();
    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();

    useTodoDataStore.setState((s) => ({
      folders: s.folders.filter((f) => f.folder_id !== folder_id),
      lists: s.lists.filter((l) => l.folder !== folder_id),
      tasks: s.tasks.filter((t) => !listIdsInFolder.includes(t.list_id)),
    }));

    const result = await deleteFolderWithContents(folder_id, listIdsInFolder);

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({ folders: prevFolders, lists: prevLists, tasks: prevTasks });
    }
    
    setIsPending(false);
  };

  return { deleteFolderWithContents: handleDeleteFolderWithContents, isPending };
}
