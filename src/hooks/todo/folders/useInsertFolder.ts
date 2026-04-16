"use client"

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { calculateNewIndex, handleError } from "@/store/todoUtils";
import { calculateNewRank } from "@/lib/lexorank";
import { insertFolder } from "@/lib/api/list/actions";
import { FolderType } from "@/lib/schemas/database.types";

export function useInsertFolder() {
  const [isPending, setIsPending] = useState(false);

  const handleInsertFolder = async (folder_name: string, folder_color: string | null) => {
    setIsPending(true);
    const user = globalUserStore?.getState().user;
    const user_id = user?.user_id ?? "";

    const optimisticId = uuidv4();
    const store = useTodoDataStore.getState();
    const lists = store.lists;
    const folders = store.folders;

    const index = calculateNewIndex(lists, folders);
    const rank = calculateNewRank(lists, folders);
    const now = new Date().toISOString();

    const optimistic: FolderType = {
      folder_id: optimisticId,
      folder_name,
      folder_color,
      folder_description: null,
      index,
      rank,
      user_id,
      updated_at: null,
      created_at: now,
    };

    try {
      useTodoDataStore.setState((state) => ({ folders: [...state.folders, optimistic] }));

      const { error } = await insertFolder(
        optimisticId,
        folder_name,
        folder_color,
        index,
        rank
      );

      if (error) {
        throw new Error(error || "No se recibieron datos del servidor.");
      }
    } catch (err) {
      useTodoDataStore.setState((state) => ({
        folders: state.folders.filter((f) => f.folder_id !== optimisticId),
      }));

      handleError(err);
    }
    
    setIsPending(false);
  };

  return { insertFolder: handleInsertFolder, isPending };
}
