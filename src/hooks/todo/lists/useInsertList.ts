"use client"

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { calculateNewIndex, handleError } from "@/store/todoUtils";
import { calculateNewRank } from "@/lib/lexorank";
import { insertList } from "@/lib/api/list/actions";
import { ListsType } from "@/lib/schemas/database.types";

export function useInsertList() {
  const [isPending, setIsPending] = useState(false);

  const handleInsertList = useCallback(async (name: string, color: string, icon: string | null) => {
    setIsPending(true);
    const user = globalUserStore?.getState().user;
    const user_id = user?.user_id ?? "";

    const optimisticId = uuidv4();
    const store = useTodoDataStore.getState();
    const lists = store.lists;
    const folders = store.folders;

    const index = calculateNewIndex(lists, folders);
    const now = new Date().toISOString();

    // const { rank: serverRank } = await getNextRankForUser(); lcomentado porque por el momento en 100 items no es un problema real este
    const rank = calculateNewRank(lists, folders);

    const optimistic: ListsType = {
      folder: null,
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
      useTodoDataStore.setState((state) => ({ lists: [...state.lists, optimistic] }));

      const { error } = await insertList(
        optimisticId,
        name,
        color,
        icon,
        rank,
        index
      );

      if (error) {
        throw new Error(error || "No se recibieron datos del servidor.");
      }
      setIsPending(false);
      return { error: null, list_id: optimisticId };
    } catch (err) {
      useTodoDataStore.setState((state) => ({
        lists: state.lists.filter((l) => l.list_id !== optimisticId),
      }));

      handleError(err);
      setIsPending(false);
      return { error: (err as Error).message };
    }
  }, []);

  return { insertList: handleInsertList, isPending };
}
