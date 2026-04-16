"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { updateNameTask } from "@/lib/api/task/actions";
import { handleError } from "@/store/todoUtils";

export function useUpdateTaskName() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateTaskName = useCallback(async (
    task_id: string,
    task_content: string,
    completed: boolean | null,
    target_date: string | null
  ) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const prevTasks = store.tasks.slice();

    useTodoDataStore.setState((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id
          ? { ...task, task_content, completed, target_date }
          : task
      ),
    }));

    const { error } = await updateNameTask(
      task_id,
      task_content,
      completed,
      target_date
    );

    if (error) {
      handleError(error);
      useTodoDataStore.setState({ tasks: prevTasks });
      setIsPending(false);
      return { error };
    }

    setIsPending(false);
    return { error: null };
  }, []);

  return { updateTaskName: handleUpdateTaskName, isPending };
}
