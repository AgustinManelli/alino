"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { getCompletedTasks } from "@/lib/api/task/actions";
import { handleError } from "@/store/todoUtils";
import { TaskType } from "@/lib/schemas/database.types";

export function useFetchCompletedTasksPage() {
  const [isPending, setIsPending] = useState(false);

  const fetchCompletedTasksPage = useCallback(async (listId: string | "home", reset: boolean = false) => {
    setIsPending(true);

    try {
      const state = useTodoDataStore.getState();

      if (reset) {
        useTodoDataStore.setState({ completedTasks: [], completedTasksPage: -1, hasMoreCompletedTasks: true });
      }

      const currentState = useTodoDataStore.getState();
      if (!currentState.hasMoreCompletedTasks) {
        setIsPending(false);
        return;
      }

      const newPage = currentState.completedTasksPage + 1;

      const listIdsToFetch: string[] =
        listId === "home"
          ? currentState.lists.map((l) => l.list_id)
          : [listId];

      const PAGE_SIZE_COMPLETED = 40;
      const { data } = await getCompletedTasks(listIdsToFetch, newPage, PAGE_SIZE_COMPLETED);

      const newTasks = reset || currentState.completedTasksPage === -1
        ? (data ?? [])
        : [...currentState.completedTasks, ...(data ?? [])];
      const newHasMore = Boolean(data && data.length === PAGE_SIZE_COMPLETED);

      useTodoDataStore.setState({
        completedTasks: newTasks as TaskType[],
        completedTasksPage: newPage,
        hasMoreCompletedTasks: newHasMore,
      });
    } catch (err) {
      handleError(err);
    } finally {
      setIsPending(false);
    }
  }, []);

  return { fetchCompletedTasksPage, isPending };
}
