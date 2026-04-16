"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateDataList } from "@/lib/api/list/actions";
import { handleError } from "@/store/todoUtils";

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

    const result = await updateDataList(list_id, list_name, color, icon);

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({ lists: prevLists });
      setIsPending(false);
      return { error: result.error };
    }

    setIsPending(false);
    return { error: null };
  }, []);

  return { updateDataList: handleUpdateDataList, isPending };
}
