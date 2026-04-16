"use client"

import { useState, useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { deleteTask } from "@/lib/api/task/actions";
import { readTaskCount, makeTaskCountPayload, handleError } from "@/store/todoUtils";

export function useDeleteTask() {
  const [isPending, setIsPending] = useState(false);

  const handleDeleteTask = useCallback(async (task_id: string) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();

    const originalTask =
      store.tasks.find((t) => t.task_id === task_id) ??
      store.completedTasks.find((t) => t.task_id === task_id);
    const prevTasks = store.tasks.slice();
    const prevCompletedTasks = store.completedTasks.slice();
    const prevLists = store.lists.slice();

    useTodoDataStore.setState((state) => {
      let updatedLists = state.lists;
      if (originalTask) {
        updatedLists = state.lists.map((currentItem) => {
          if (currentItem.list.list_id === originalTask.list_id) {
            const currentCount = readTaskCount(currentItem, state.tasks);
            return {
              ...currentItem,
              list: {
                ...currentItem.list,
                tasks: makeTaskCountPayload(Math.max(0, currentCount - 1)),
              },
            };
          }
          return currentItem;
        });
      }

      return {
        tasks: state.tasks.filter((task) => task.task_id !== task_id),
        completedTasks: state.completedTasks.filter((task) => task.task_id !== task_id),
        lists: updatedLists,
      };
    });

    const result = await deleteTask(task_id);

    if (result?.error) {
      handleError(result.error);
      useTodoDataStore.setState({
        tasks: prevTasks,
        completedTasks: prevCompletedTasks,
        lists: prevLists,
      });
    }

    setIsPending(false);
  }, []);

  return { deleteTask: handleDeleteTask, isPending };
}
