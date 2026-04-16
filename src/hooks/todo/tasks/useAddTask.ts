"use client"

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { calculateNewRank } from "@/lib/lexorank";
import { insertTask } from "@/lib/api/task/actions";
import { UserProfile, TaskType } from "@/lib/schemas/database.types";
import { readTaskCount, makeTaskCountPayload, handleError } from "@/store/todoUtils";

export function useAddTask() {
  const [isPending, setIsPending] = useState(false);

  const addTask = useCallback(async (
    list_id: string,
    task_content: string,
    target_date: string | null,
    note: boolean
  ) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const user = globalUserStore?.getState().user;

    if (!user) {
      const errorMsg = "No se puede crear la tarea: el usuario no está autenticado.";
      setIsPending(false);
      return { error: errorMsg };
    }

    const optimisticId = uuidv4();
    const createdBy: UserProfile = {
      user_id: user.user_id,
      display_name: user.display_name,
      username: user.username,
      avatar_url: user.avatar_url,
    };

    const listTasks = store.tasks.filter((t) => t.list_id === list_id);
    const rank = calculateNewRank(listTasks, []);

    const optimisticTask: TaskType = {
      task_id: optimisticId,
      task_content,
      list_id,
      target_date,
      completed: note ? null : false,
      index: 0,
      rank,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: createdBy,
      description: "",
    };

    const prevTasks = store.tasks.slice();
    const prevLists = store.lists.slice();

    useTodoDataStore.setState((state) => {
      const updatedLists = state.lists.map((currentItem) => {
        if (currentItem.list.list_id === list_id) {
          const currentCount = readTaskCount(currentItem, state.tasks);
          return {
            ...currentItem,
            list: {
              ...currentItem.list,
              tasks: makeTaskCountPayload(currentCount + 1),
            },
          };
        }
        return currentItem;
      });

      return {
        tasks: [optimisticTask, ...state.tasks],
        lists: updatedLists,
      };
    });

    const { data, error } = await insertTask(
      list_id,
      task_content,
      optimisticId,
      target_date,
      note,
      rank
    );

    if (error) {
      handleError(error);
      useTodoDataStore.setState({ tasks: prevTasks, lists: prevLists });
      setIsPending(false);
      return { error };
    }

    useTodoDataStore.setState((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.task_id === optimisticId && data) {
          const { created_by: _discarded, ...restData } = data;
          return { ...t, ...restData, created_by: t.created_by };
        }
        return t;
      }),
    }));

    setIsPending(false);
    return { error: null };
  }, []);

  return { addTask, isPending };
}
