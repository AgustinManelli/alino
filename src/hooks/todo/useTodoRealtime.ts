"use client"

import { useCallback } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { globalUserStore } from "@/store/useUserDataStore";
import { getSingleLists } from "@/lib/api/list/actions";
import {
  ListsRow,
  ListsType,
  MembershipRow,
  TaskType,
} from "@/lib/schemas/database.types";
import {
  readTaskCount,
  readFolderMembershipCount,
  makeTaskCountPayload,
  makeMembershipCountPayload,
} from "@/store/todoUtils";

export function useTodoRealtime() {
  const { lists, tasks, folders, completedTasks, updateState } = useTodoDataStore();

  const onAddList = useCallback(async (membership: MembershipRow) => {
    const result = await getSingleLists(membership.list_id);
    if (!result?.data) return;

    const newItemForStore: ListsType = {
      ...membership,
      list: result.data as ListsRow,
    };

    const currentLists = useTodoDataStore.getState().lists;
    const exists = currentLists.some((l) => l.list_id === newItemForStore.list_id);

    if (exists) {
      updateState({
        lists: currentLists.map((item) =>
          item.list_id === newItemForStore.list_id ? newItemForStore : item
        ),
      });
    } else {
      updateState({
        lists: [...currentLists, newItemForStore],
      });
    }
  }, [updateState]);

  const onDeleteList = useCallback((list: MembershipRow) => {
    const user = globalUserStore?.getState().user;
    if (user && user.user_id && list.user_id !== user.user_id) return;

    const state = useTodoDataStore.getState();
    const deletedList = state.lists.find((l) => l.list_id === list.list_id);
    const folderId = deletedList?.folder ?? null;

    const updatedFolders = folderId
      ? state.folders.map((f) => {
          if (f.folder_id !== folderId) return f;
          const currentCount = readFolderMembershipCount(f, state.lists);
          return {
            ...f,
            memberships: makeMembershipCountPayload(Math.max(0, currentCount - 1)),
          };
        })
      : state.folders;

    updateState({
      lists: state.lists.filter((l) => l.list_id !== list.list_id),
      tasks: state.tasks.filter((t) => t.list_id !== list.list_id),
      folders: updatedFolders,
    });
  }, [updateState]);

  const onUpdateList = useCallback((updatedList: ListsRow) => {
    const currentLists = useTodoDataStore.getState().lists;
    updateState({
      lists: currentLists.map((currentItem) =>
        currentItem.list.list_id === updatedList.list_id
          ? { ...currentItem, list: { ...currentItem.list, ...updatedList } }
          : currentItem
      ),
    });
  }, [updateState]);

  const onUpdateMembership = useCallback((updatedMembership: MembershipRow) => {
    const currentLists = useTodoDataStore.getState().lists;
    updateState({
      lists: currentLists.map((currentItem) =>
        currentItem.list_id === updatedMembership.list_id
          ? { ...currentItem, ...updatedMembership }
          : currentItem
      ),
    });
  }, [updateState]);

  const onAddTask = useCallback((task: TaskType | any) => {
    const state = useTodoDataStore.getState();
    const existingTask = state.tasks.find((t) => t.task_id === task.task_id);
    let taskToInsert = task;
    if (existingTask && typeof task.created_by === "string") {
      taskToInsert = { ...task, created_by: existingTask.created_by };
    }

    let updatedLists = state.lists;
    if (!existingTask) {
      updatedLists = state.lists.map((currentItem) => {
        if (currentItem.list.list_id === task.list_id) {
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
    }

    updateState({
      tasks: [taskToInsert, ...state.tasks].filter(
        (t, index, self) =>
          index === self.findIndex((tt) => tt.task_id === t.task_id),
      ),
      lists: updatedLists,
    });
  }, [updateState]);

  const onUpdateTask = useCallback((task: TaskType | any) => {
    const currentTasks = useTodoDataStore.getState().tasks;
    updateState({
      tasks: currentTasks.map((t) => {
        if (t.task_id === task.task_id) {
          // Preservamos el objeto created_by previo si el incoming es solo un string o ID
          const createdBy =
            typeof task.created_by === "string" ? t.created_by : task.created_by;
          return { ...t, ...task, created_by: createdBy };
        }
        return t;
      }),
    });
  }, [updateState]);

  const onDeleteTask = useCallback((task: { task_id: string }) => {
    const state = useTodoDataStore.getState();
    const existingTask = state.tasks.find((t) => t.task_id === task.task_id);

    let updatedLists = state.lists;
    if (existingTask) {
      updatedLists = state.lists.map((currentItem) => {
        if (currentItem.list.list_id === existingTask.list_id) {
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

    updateState({
      tasks: state.tasks.filter((t) => t.task_id !== task.task_id),
      completedTasks: state.completedTasks.filter((t) => t.task_id !== task.task_id),
      lists: updatedLists,
    });
  }, [updateState]);

  return {
    onAddList,
    onDeleteList,
    onUpdateList,
    onUpdateMembership,
    onAddTask,
    onUpdateTask,
    onDeleteTask,
  };
}
