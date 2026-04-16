"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { PAGE_SIZE, handleError } from "@/store/todoUtils";
import { TaskType } from "@/lib/schemas/database.types";

export function useFetchTasksPage() {
  const [isPending, setIsPending] = useState(false);

  const fetchTasksPage = useCallback(async (listId: string | "home", reset: boolean = false) => {
    setIsPending(true);

    try {
      const state = useTodoDataStore.getState();

      if (reset) {
        const savedCache: Record<
          string,
          { tasks: TaskType[]; page: number; hasMore: boolean }
        > = {};

        if (state.currentListId) {
          savedCache[state.currentListId] = {
            tasks: state.tasks,
            page: state.tasksPage,
            hasMore: state.hasMoreTasks,
          };
        }

        const cached = state.tasksByList[listId] ?? savedCache[listId];

        if (cached) {
          useTodoDataStore.setState((s) => ({
            tasks: cached.tasks,
            tasksPage: cached.page,
            hasMoreTasks: cached.hasMore,
            currentListId: listId,
            tasksByList: {
              ...s.tasksByList,
              ...(state.currentListId
                ? {
                    [state.currentListId]: {
                      tasks: state.tasks,
                      page: state.tasksPage,
                      hasMore: state.hasMoreTasks,
                    },
                  }
                : {}),
            },
          }));
          if (cached.tasks.length > 0) {
            setIsPending(false);
            return;
          }
        } else {
          useTodoDataStore.setState((s) => ({
            tasks: [],
            tasksPage: -1,
            hasMoreTasks: true,
            currentListId: listId,
            tasksByList: {
              ...s.tasksByList,
              ...(state.currentListId
                ? {
                    [state.currentListId]: {
                      tasks: state.tasks,
                      page: state.tasksPage,
                      hasMore: state.hasMoreTasks,
                    },
                  }
                : {}),
            },
          }));
        }
      }

      const currentState = useTodoDataStore.getState();
      const currentSyncState = useSyncStore.getState();
      if (!currentState.hasMoreTasks || currentSyncState.loadingQueue > 0) {
        setIsPending(false);
        return;
      }

      const newPage = currentState.tasksPage + 1;
      useSyncStore.getState().addLoading();

      const listIdsToFetch: string[] =
        listId === "home"
          ? currentState.lists.map((l) => l.list_id)
          : [listId];

      const { getPaginatedTasks } = await import("@/lib/api/task/actions");
      const { data } = await getPaginatedTasks(
        listIdsToFetch,
        newPage,
        PAGE_SIZE,
        currentState.taskSort
      );

      const newTasks = reset || currentState.tasksPage === -1
        ? (data ?? [])
        : [...currentState.tasks, ...(data ?? [])];
      const newHasMore = Boolean(data && data.length === PAGE_SIZE);

      useTodoDataStore.setState((s) => ({
        tasks: newTasks as TaskType[],
        tasksPage: newPage,
        hasMoreTasks: newHasMore,
        tasksByList: {
          ...s.tasksByList,
          [listId]: {
            tasks: newTasks as TaskType[],
            page: newPage,
            hasMore: newHasMore,
          },
        },
      }));
    } catch (err) {
      handleError(err);
    } finally {
      useSyncStore.getState().removeLoading();
      setIsPending(false);
    }
  }, []);

  return { fetchTasksPage, isPending };
}
