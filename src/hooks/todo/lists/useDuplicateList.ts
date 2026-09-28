"use client";

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { calculateNewIndex, handleError, readFolderMembershipCount, makeMembershipCountPayload } from "@/store/todoUtils";
import { calcRankForInsertion, compareRanks } from "@/lib/lexorank";
import { duplicateList } from "@/lib/api/list/actions";
import { ListsType, FolderType } from "@/lib/schemas/database.types";
import { customToast } from "@/lib/toasts";

function calculateRankForDuplicate(
  sourceList: ListsType,
  lists: ListsType[],
  folders: FolderType[]
): string {
  if (sourceList.folder) {
    const folderLists = lists
      .filter((l) => l.folder === sourceList.folder)
      .sort((a, b) =>
        compareRanks(
          { rank: a.rank, id: a.list_id },
          { rank: b.rank, id: b.list_id }
        )
      );

    const sourceIndex = folderLists.findIndex(
      (l) => l.list_id === sourceList.list_id
    );
    const insertIndex =
      sourceIndex >= 0 ? sourceIndex + 1 : folderLists.length;

    return calcRankForInsertion(
      folderLists.map((l) => ({ rank: l.rank, id: l.list_id })),
      insertIndex
    );
  }

  const rootItems: { rank?: string | null; id?: string }[] = [
    ...folders
      .filter((f) => !f.pinned)
      .map((f) => ({ rank: f.rank, id: f.folder_id })),
    ...lists
      .filter((l) => !l.folder && !l.pinned)
      .map((l) => ({ rank: l.rank, id: l.list_id })),
  ].sort((a, b) => compareRanks(a, b));

  const sourceIndex = rootItems.findIndex(
    (it) => it.id === sourceList.list_id
  );
  const insertIndex =
    sourceIndex >= 0 ? sourceIndex + 1 : 0;

  return calcRankForInsertion(rootItems, insertIndex);
}

export function useDuplicateList() {
  const [isPending, setIsPending] = useState(false);

  const handleDuplicateList = useCallback(async (sourceList: ListsType) => {
    setIsPending(true);
    const user = globalUserStore?.getState().user;
    const user_id = user?.user_id ?? "";

    const optimisticId = uuidv4();
    const store = useTodoDataStore.getState();
    const lists = store.lists;
    const folders = store.folders;

    const index = calculateNewIndex(lists, folders);
    const rank = calculateRankForDuplicate(sourceList, lists, folders);
    const now = new Date().toISOString();

    const optimistic: ListsType = {
      folder: sourceList.folder,
      index,
      list_id: optimisticId,
      pinned: false,
      rank,
      role: "owner",
      shared_by: null,
      shared_since: now,
      updated_at: null,
      user_id,
      list: {
        color: sourceList.list.color,
        created_at: now,
        description: sourceList.list.description,
        icon: sourceList.list.icon,
        list_id: optimisticId,
        list_name: sourceList.list.list_name,
        owner_id: user_id,
        updated_at: null,
        is_shared: false,
        non_owner_count: 0,
        tasks: sourceList.list.tasks,
      },
    };

    try {
      useTodoDataStore.setState((state) => {
        let updatedFolders = state.folders;
        if (sourceList.folder) {
          updatedFolders = state.folders.map((f) => {
            if (f.folder_id === sourceList.folder) {
              const currentCount = readFolderMembershipCount(f, state.lists);
              return {
                ...f,
                memberships: makeMembershipCountPayload(currentCount + 1),
              };
            }
            return f;
          });
        }
        return {
          folders: updatedFolders,
          lists: [...state.lists, optimistic],
        };
      });

      const { error } = await duplicateList(
        sourceList.list_id,
        optimisticId,
        rank,
        index
      );

      if (error) {
        throw new Error(error);
      }

      customToast.success("Lista duplicada");
      setIsPending(false);
      return { error: null, list_id: optimisticId };
    } catch (err) {
      useTodoDataStore.setState((state) => {
        let updatedFolders = state.folders;
        if (sourceList.folder) {
          updatedFolders = state.folders.map((f) => {
            if (f.folder_id === sourceList.folder) {
              const currentCount = readFolderMembershipCount(f, state.lists);
              return {
                ...f,
                memberships: makeMembershipCountPayload(Math.max(0, currentCount - 1)),
              };
            }
            return f;
          });
        }
        return {
          folders: updatedFolders,
          lists: state.lists.filter((l) => l.list_id !== optimisticId),
        };
      });

      handleError(err);
      setIsPending(false);
      return { error: (err as Error).message };
    }
  }, []);

  return { duplicateList: handleDuplicateList, isPending };
}
