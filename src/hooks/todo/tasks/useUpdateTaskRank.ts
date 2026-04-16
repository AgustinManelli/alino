"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateTaskRank } from "@/lib/api/task/actions";
import { handleError } from "@/store/todoUtils";

export function useUpdateTaskRank() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateTaskRank = useCallback(async (task_id: string, new_rank: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();

    const originalTask = store.tasks.find((t) => t.task_id === task_id);
    if (!originalTask) {
      setIsPending(false);
      return { error: "Task not found" };
    }
    const prevTasks = store.tasks.slice();

    useTodoDataStore.setState((state) => {
      const newTasks = state.tasks.map((t) =>
        t.task_id === task_id ? { ...t, rank: new_rank } : t
      );

      if (state.taskSort === "default") {
        newTasks.sort((a, b) => {
          const ra = a.rank ?? "";
          const rb = b.rank ?? "";
          if (ra > rb) return -1;
          if (ra < rb) return 1;
          return (
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
      }

      return { tasks: newTasks };
    });

    const { error } = await updateTaskRank(task_id, new_rank);

    if (error) {
      handleError(error);
      useTodoDataStore.setState({ tasks: prevTasks });
      setIsPending(false);
      return { error };
    }

    setIsPending(false);
    return { error: null };
  }, []);

  return { updateTaskRank: handleUpdateTaskRank, isPending };
}
