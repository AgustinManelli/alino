"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateDataList } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

import {
  saveSingleListToIndexedDB,
  enqueueSyncMutation,
  isNetworkError,
} from "@/lib/offline/sidebarSync";

export function useUpdateDataList() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateDataList = useCallback(async (
    list_id: string,
    list_name: string,
    color: string,
    icon: string | null
  ) => {
    setIsPending(true);
    const prevLists = useTodoDataStore.getState().lists.slice();

    useTodoDataStore.setState((state) => ({
      lists: state.lists.map((list) =>
        list.list_id === list_id
          ? {
              ...list,
              list: {
                ...list.list,
                list_name,
                color,
                icon,
              },
            }
          : list
      ),
    }));

    const updatedList = useTodoDataStore.getState().lists.find((l) => l.list_id === list_id);
    if (updatedList) {
      await saveSingleListToIndexedDB(updatedList);
    }

    const payload = { list_id, name: list_name, color, icon };

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      await enqueueSyncMutation("update_list_data", "list", payload);
      setIsPending(false);
      return { error: null };
    }

    try {
      const result = await updateDataList(list_id, list_name, color, icon);

      if (result?.error) {
        if (isNetworkError(result.error)) {
          await enqueueSyncMutation("update_list_data", "list", payload);
          setIsPending(false);
          return { error: null };
        }
        handleError(result.error);
        useTodoDataStore.setState({ lists: prevLists });
        const oldList = prevLists.find((l) => l.list_id === list_id);
        if (oldList) saveSingleListToIndexedDB(oldList);
        setIsPending(false);
        return { error: result.error };
      }
    } catch (err) {
      if (isNetworkError(err)) {
        await enqueueSyncMutation("update_list_data", "list", payload);
        setIsPending(false);
        return { error: null };
      }
      handleError(err);
      useTodoDataStore.setState({ lists: prevLists });
      const oldList = prevLists.find((l) => l.list_id === list_id);
      if (oldList) saveSingleListToIndexedDB(oldList);
      setIsPending(false);
      return { error: (err as Error).message };
    }

    setIsPending(false);
    return { error: null };
  }, []);

  return { updateDataList: handleUpdateDataList, isPending };
}
