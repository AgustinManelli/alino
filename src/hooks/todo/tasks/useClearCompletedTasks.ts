"use client";

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { clearCompletedTasks } from "@/lib/api/task/actions";
import { handleError, makeTaskCountPayload, readTaskCount } from "@/store/todoUtils";
import { customToast } from "@/lib/toasts";

export function useClearCompletedTasks() {
  const [isPending, setIsPending] = useState(false);

  const handleClearCompleted = useCallback(async (list_id: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const previousTasks = store.tasks;
    const previousLists = store.lists;

    const completedCount = previousTasks.filter(
      (t) => t.list_id === list_id && t.completed === true
    ).length;

    try {
      useTodoDataStore.setState((state) => ({
        tasks: state.tasks.filter(
          (t) => !(t.list_id === list_id && t.completed === true)
        ),
        lists: state.lists.map((l) => {
          if (l.list_id === list_id) {
            const currentCount = readTaskCount(l, state.tasks);
            const newCount = Math.max(0, currentCount - completedCount);
            return {
              ...l,
              list: {
                ...l.list,
                tasks: makeTaskCountPayload(newCount),
              },
            };
          }
          return l;
        }),
      }));

      const result = await clearCompletedTasks(list_id);
      if (result?.error) {
        throw new Error(result.error);
      }

      customToast.success("Tareas completadas eliminadas");
    } catch (err) {
      useTodoDataStore.setState({
        tasks: previousTasks,
        lists: previousLists,
      });
      handleError(err);
    }

    setIsPending(false);
  }, []);

  return { clearCompletedTasks: handleClearCompleted, isPending };
}
