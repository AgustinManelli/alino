"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteList } from "@/lib/api/list/actions";
import { readFolderMembershipCount, makeMembershipCountPayload, handleError } from "@/store/todoUtils";

export function useDeleteList() {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteList = useCallback(async (list_id: string) => {
    setIsPending(true);
    const state = useTodoDataStore.getState();
    const deletedList = state.lists.find((l) => l.list_id === list_id);
    const folderId = deletedList?.folder ?? null;

    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();
    const prevFolders = state.folders.slice();

    useTodoDataStore.setState((s) => {
      const updatedFolders = folderId
        ? s.folders.map((f) => {
            if (f.folder_id !== folderId) return f;
            const currentCount = readFolderMembershipCount(f, s.lists);
            return {
              ...f,
              memberships: makeMembershipCountPayload(
                Math.max(0, currentCount - 1)
              ),
            };
          })
        : s.folders;

      return {
        lists: s.lists.filter((l) => l.list_id !== list_id),
        tasks: s.tasks.filter((t) => t.list_id !== list_id),
        folders: updatedFolders,
      };
    });

    const result = await deleteList(list_id);

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({ lists: prevLists, tasks: prevTasks, folders: prevFolders });
    }
    
    setIsPending(false);
  }, []);

  return { deleteList: handleDeleteList, isPending };
}
