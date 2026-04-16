"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { TaskSortOption } from "@/lib/schemas/todo.types";
import { useFetchTasksPage } from "./useFetchTasksPage";

export function useSetTaskSort() {
  const [isPending, setIsPending] = useState(false);
  const { fetchTasksPage } = useFetchTasksPage();

  const handleSetTaskSort = useCallback(async (sort: TaskSortOption) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const currentListId = store.currentListId;

    useTodoDataStore.setState({
      taskSort: sort,
      tasksByList: {},
      tasks: [],
      tasksPage: -1,
      hasMoreTasks: true,
    });

    if (currentListId) {
      await fetchTasksPage(currentListId, false);
    }

    setIsPending(false);
  }, [fetchTasksPage]);

  return { setTaskSort: handleSetTaskSort, isPending };
}
