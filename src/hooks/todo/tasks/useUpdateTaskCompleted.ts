"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useStreakStore } from "@/store/useStreakStore";
import { updateCompletedTask } from "@/lib/api/task/actions";
import { handleError, makeTaskCountPayload, readTaskCount } from "@/store/todoUtils";

export function useUpdateTaskCompleted() {
  const [isPending, setIsPending] = useState(false);

  const handleUpdateTaskCompleted = useCallback(async (task_id: string, completed: boolean) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();

    const prevTasks = store.tasks.slice();
    const prevCompletedTasks = store.completedTasks.slice();
    const prevLists = store.lists.slice();

    useTodoDataStore.setState((state) => {
      const task = state.tasks.find((t) => t.task_id === task_id);
      const completedTask = state.completedTasks.find((t) => t.task_id === task_id);
      const targetListId = task?.list_id ?? completedTask?.list_id;

      let updatedLists = state.lists;
      if (targetListId) {
        updatedLists = state.lists.map((l) => {
          if (l.list_id === targetListId || l.list.list_id === targetListId) {
            const currentCount = readTaskCount(l, state.tasks);
            const newCount = completed
              ? Math.max(0, currentCount - 1)
              : currentCount + 1;
            return {
              ...l,
              list: {
                ...l.list,
                tasks: makeTaskCountPayload(newCount),
              },
            };
          }
          return l;
        });
      }

      if (completed) {
        const updatedTask = task ? { ...task, completed } : completedTask ? { ...completedTask, completed } : null;
        return {
          tasks: state.tasks.filter((t) => t.task_id !== task_id),
          completedTasks: updatedTask
            ? state.completedTasks.some((t) => t.task_id === task_id)
              ? state.completedTasks.map((t) => t.task_id === task_id ? updatedTask : t)
              : [updatedTask, ...state.completedTasks]
            : state.completedTasks,
          lists: updatedLists,
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
          lists: updatedLists,
        };
      }
    });

    const { error } = await updateCompletedTask(task_id, completed);
    const { fetchStreak } = useStreakStore.getState();

    if (error) {
      handleError(error);
      useTodoDataStore.setState({
        tasks: prevTasks,
        completedTasks: prevCompletedTasks,
        lists: prevLists,
      });
    } else if (completed) {
      fetchStreak(true);
    }

    setIsPending(false);
  }, []);

  return { updateTaskCompleted: handleUpdateTaskCompleted, isPending };
}
