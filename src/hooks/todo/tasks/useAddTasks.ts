"use client"

import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { calculateNewRank, calculateNextRankAfter } from "@/lib/lexorank";
import { insertTasks } from "@/lib/api/task/actions";
import { UserProfile, TaskType } from "@/lib/schemas/database.types";
import { handleError } from "@/store/todoUtils";

export function useAddTasks() {
  const [isPending, setIsPending] = useState(false);

  const addTasks = useCallback(async (
    tasksData: {
      list_id: string;
      task_content: string;
      target_date: string | null;
      note: boolean;
    }[]
  ) => {
    setIsPending(true);
    const store = useTodoDataStore.getState();
    const user = globalUserStore?.getState().user;

    if (!user) {
      const errorMsg = "No se puede crear las tareas: el usuario no está autenticado.";
      setIsPending(false);
      return { error: errorMsg };
    }

    const now = new Date().toISOString();
    const createdBy: UserProfile = {
      user_id: user.user_id,
      display_name: user.display_name,
      username: user.username,
      avatar_url: user.avatar_url,
    };

    const primaryListId = tasksData[0]?.list_id;
    const listTasks = primaryListId
      ? store.tasks.filter((t) => t.list_id === primaryListId)
      : [];

    const taskRanks: string[] = [];
    let currentRank = calculateNewRank(listTasks, []);
    taskRanks.push(currentRank);
    for (let i = 1; i < tasksData.length; i++) {
      currentRank = calculateNextRankAfter(currentRank);
      taskRanks.push(currentRank);
    }
    taskRanks.reverse();

    const optimisticTasks: TaskType[] = tasksData.map((t, i) => ({
      task_id: uuidv4(),
      task_content: t.task_content,
      list_id: t.list_id,
      target_date: t.target_date,
      completed: t.note ? null : false,
      index: 0,
      rank: taskRanks[i] ?? null,
      created_at: now,
      updated_at: now,
      created_by: createdBy,
      description: "",
    }));

    const prevTasks = store.tasks.slice();

    useTodoDataStore.setState((state) => ({
      tasks: [...optimisticTasks, ...state.tasks],
    }));

    const { data, error } = await insertTasks(
      optimisticTasks.map((t) => ({
        task_id: t.task_id,
        list_id: t.list_id,
        task_content: t.task_content,
        target_date: t.target_date,
        completed: t.completed,
        rank: t.rank,
      }))
    );

    if (error) {
      handleError(error);
      useTodoDataStore.setState({ tasks: prevTasks });
      setIsPending(false);
      return { error };
    }

    useTodoDataStore.setState((state) => ({
      tasks: state.tasks.map((t) => {
        const found = data?.find((d) => d.task_id === t.task_id);
        if (found) {
          const { created_by: _discarded, ...restData } = found;
          return { ...t, ...restData, created_by: t.created_by };
        }
        return t;
      }),
    }));

    setIsPending(false);
    return { error: null };
  }, []);

  return { addTasks, isPending };
}
