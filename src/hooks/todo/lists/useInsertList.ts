"use client"

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { calculateNewIndex, handleError, readFolderMembershipCount, makeMembershipCountPayload } from "@/store/todoUtils";
import { calculateNewRank, calcRankForInsertion, compareRanks } from "@/lib/lexorank";
import { insertList } from "@/lib/api/list/actions";
import { ListsType } from "@/lib/schemas/database.types";

import {
  saveSingleListToIndexedDB,
  removeListFromIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useInsertList() {
  const [isPending, setIsPending] = useState(false);

  const handleInsertList = useCallback(async (
    name: string,
    color: string,
    icon: string | null,
    folder_id?: string | null,
    targetRank?: string | null
  ) => {
    setIsPending(true);
    const user = globalUserStore?.getState().user;
    const user_id = user?.user_id ?? "";

    const optimisticId = uuidv4();
    const store = useTodoDataStore.getState();
    const lists = store.lists;
    const folders = store.folders;

    const index = calculateNewIndex(lists, folders);
    const now = new Date().toISOString();

    const rank =
      targetRank ??
      (folder_id
        ? calcRankForInsertion(
          lists
            .filter((l) => l.folder === folder_id)
            .sort((a, b) =>
              compareRanks(
                { rank: a.rank, id: a.list_id },
                { rank: b.rank, id: b.list_id }
              )
            ),
          0
        )
        : calculateNewRank(lists, folders));

    const optimistic: ListsType = {
      folder: folder_id ?? null,
      index,
      list_id: optimisticId,
      pinned: false,
      rank: rank,
      role: "owner",
      shared_by: null,
      shared_since: now,
      updated_at: null,
      user_id,
      list: {
        color: color ?? "#87189d",
        created_at: now,
        description: null,
        icon: icon ?? null,
        list_id: optimisticId,
        list_name: name,
        owner_id: user_id,
        updated_at: null,
        is_shared: false,
        non_owner_count: 0,
      },
    };

    try {
      useTodoDataStore.setState((state) => {
        let updatedFolders = state.folders;
        if (folder_id) {
          updatedFolders = state.folders.map((f) => {
            if (f.folder_id === folder_id) {
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

      await saveSingleListToIndexedDB(optimistic);

      const payload = {
        list_id: optimisticId,
        name,
        color,
        icon,
        rank,
        index,
        folder_id,
      };

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        await enqueueSyncMutation("insert_list", "list", payload);
        setIsPending(false);
        return { error: null, list_id: optimisticId };
      }

      const { error } = await insertList(
        optimisticId,
        name,
        color,
        icon,
        rank,
        index,
        folder_id
      );

      if (error) {
        if (isNetworkError(error)) {
          await enqueueSyncMutation("insert_list", "list", payload);
          setIsPending(false);
          return { error: null, list_id: optimisticId };
        }
        throw new Error(error || "No se recibieron datos del servidor.");
      }
      setIsPending(false);
      return { error: null, list_id: optimisticId };
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("insert_list", "list", {
          list_id: optimisticId,
          name,
          color,
          icon,
          rank,
          index,
          folder_id,
        });
        setIsPending(false);
        return { error: null, list_id: optimisticId };
      }

      await removeListFromIndexedDB(optimisticId);
      useTodoDataStore.setState((state) => {
        let updatedFolders = state.folders;
        if (folder_id) {
          updatedFolders = state.folders.map((f) => {
            if (f.folder_id === folder_id) {
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

  return { insertList: handleInsertList, isPending };
}
