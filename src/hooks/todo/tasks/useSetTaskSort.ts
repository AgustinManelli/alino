"use client"

import { useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { TaskSortOption } from "@/lib/schemas/todo.types";

export function useSetTaskSort() {
  const handleSetTaskSort = useCallback((sort: TaskSortOption) => {
    useTodoDataStore.setState({
      taskSort: sort,
    });
  }, []);

  return { setTaskSort: handleSetTaskSort, isPending: false };
}

