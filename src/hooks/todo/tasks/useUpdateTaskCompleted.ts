"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useStreakStore } from "@/store/useStreakStore";
import { updateCompletedTask } from "@/lib/api/task/actions";
import { handleError } from "@/store/todoUtils";

export function useUpdateTaskCompleted() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateTaskCompleted = useCallback(async (task_id: string, completed: boolean) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();

    const prevTasks = store.tasks.slice();
    const prevCompletedTasks = store.completedTasks.slice();

    useTodoDataStore.setState((state) => {
      const task = state.tasks.find((t) => t.task_id === task_id);
      const completedTask = state.completedTasks.find((t) => t.task_id === task_id);

      if (completed) {
        const updatedTask = task ? { ...task, completed } : completedTask ? { ...completedTask, completed } : null;
        return {
          tasks: state.tasks.filter((t) => t.task_id !== task_id),
          completedTasks: updatedTask
            ? state.completedTasks.some((t) => t.task_id === task_id)
              ? state.completedTasks.map((t) => t.task_id === task_id ? updatedTask : t)
              : [updatedTask, ...state.completedTasks]
            : state.completedTasks,
        };
      } else {
        const updatedTask = completedTask ? { ...completedTask, completed } : task ? { ...task, completed } : null;
        return {
          completedTasks: state.completedTasks.filter((t) => t.task_id !== task_id),
          tasks: updatedTask
            ? state.tasks.some((t) => t.task_id === task_id)
              ? state.tasks.map((t) => t.task_id === task_id ? updatedTask : t)
              : [updatedTask, ...state.tasks]
            : state.tasks,
        };
      }
    });

    const { error } = await updateCompletedTask(task_id, completed);
    const { fetchStreak } = useStreakStore.getState();

    if (error) {
      handleError(error);
      useTodoDataStore.setState({ tasks: prevTasks, completedTasks: prevCompletedTasks });
    } else if (completed) {
      // Refresh streak if task was marked as completed
      fetchStreak();
    }

    setIsPending(false);
  }, []);

  return { updateTaskCompleted: handleUpdateTaskCompleted, isPending };
}
