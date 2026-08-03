"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteMultipleItems } from "@/lib/api/list/actions";
import { handleError, readFolderMembershipCount, makeMembershipCountPayload } from "@/store/todoUtils";
import { useSidebarSelectionStore, SelectionItem } from "@/store/useSidebarSelectionStore";

export function useDeleteMultipleItems() {
  const [isPending, setIsPending] = useState(false);
  const cancelSelectionMode = useSidebarSelectionStore((s) => s.cancelSelectionMode);

  const handleDeleteMultiple = useCallback(async (
    selectedItems: SelectionItem[],
    folderOptions: { folderId: string; option: "keep_lists" | "delete_contents" }[]
  ) => {
    setIsPending(true);
    const state = useTodoDataStore.getState();

    const prevFolders = state.folders.slice();
    const prevLists = state.lists.slice();
    const prevTasks = state.tasks.slice();
    const directlySelectedListIds = selectedItems
      .filter((x) => x.kind === "list")
      .map((x) => x.id);

    const folderIdsToDelete = folderOptions.map((o) => o.folderId);
    
    const listsInDeleteFolders = state.lists.filter(
      (l) => l.folder && folderIdsToDelete.includes(l.folder)
    );

    const deleteContentsFolderIds = folderOptions
      .filter((o) => o.option === "delete_contents")
      .map((o) => o.folderId);

    const keepListsFolderIds = folderOptions
      .filter((o) => o.option === "keep_lists")
      .map((o) => o.folderId);

    const listIdsToDelete = new Set([
      ...directlySelectedListIds,
      ...listsInDeleteFolders
        .filter((l) => l.folder && deleteContentsFolderIds.includes(l.folder))
        .map((l) => l.list_id),
    ]);

    useTodoDataStore.setState((s) => {
      const updatedFolders = s.folders.filter(
        (f) => !folderIdsToDelete.includes(f.folder_id)
      );

      const updatedLists = s.lists
        .filter((l) => !listIdsToDelete.has(l.list_id))
        .map((l) => {
          if (l.folder && keepListsFolderIds.includes(l.folder)) {
            return { ...l, folder: null };
          }
          return l;
        });

      const updatedTasks = s.tasks.filter((t) => !listIdsToDelete.has(t.list_id));

      return {
        folders: updatedFolders,
        lists: updatedLists,
        tasks: updatedTasks,
      };
    });

    const result = await deleteMultipleItems(
      Array.from(listIdsToDelete),
      folderOptions
    );

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({
        folders: prevFolders,
        lists: prevLists,
        tasks: prevTasks,
      });
    } else {
      cancelSelectionMode();
    }

    setIsPending(false);
    return result;
  }, [cancelSelectionMode]);

  return { deleteMultiple: handleDeleteMultiple, isPending };
}
