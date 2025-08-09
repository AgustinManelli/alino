"use client";

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { produce } from "immer";
import { toast } from "sonner";

import {
  getLists,
  insertList,
  deleteList,
  insertTask,
  deleteTask,
  updateDataList,
  updateCompletedTask,
  // updatePinnedList,
  updateIndexList,
  updateNameTask,
  // updateAllIndexLists,
  deleteAllLists,
  // deleteAllTasks,
} from "@/lib/todo/actions";
import { Database } from "@/lib/schemas/todo-schema";

type MembershipRow = Database["public"]["Tables"]["list_memberships"]["Row"];
type ListsRow = Database["public"]["Tables"]["lists"]["Row"];
type ListsType = MembershipRow & { list: ListsRow };

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type UserProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "user_id" | "display_name" | "username" | "avatar_url"
>;
type TaskType = Omit<TaskRow, "created_by"> & {
  created_by: UserProfile | null;
};

type UserComplete = Database["public"]["Tables"]["users"]["Row"];

const POS_INDEX = 16384;
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

type TodoStore = {
  lists: ListsType[];
  tasks: TaskType[];
  loadingQueue: number;
  user: UserComplete | null;
  setLists: (list: ListsType[]) => Promise<void>;
  getLists: () => Promise<void>;
  getListById: (list_id: string) => ListsType | undefined;
  subscriptionAddList: (list: ListsType) => void;
  subscriptionDeleteList: (listId: string) => void;
  subscriptionUpdateList: (updatedList: ListsRow) => void;
  subscriptionUpdateMembership: (updatedMembership: MembershipRow) => void;
  insertList: (
    name: string,
    color: string,
    icon: string | null
  ) => Promise<void>;
  deleteList: (list_id: string) => Promise<void>;
  updateDataList: (
    list_id: string,
    list_name: string,
    color: string,
    icon: string | null
  ) => Promise<{ error: string | null }>;
  deleteAllLists: () => Promise<void>;
  addTask: (
    list_id: string,
    task_content: string,
    target_date: string | null
  ) => Promise<{ error: string | null }>;
  deleteTask: (task_id: string) => Promise<void>;
  updateTaskCompleted: (task_id: string, completed: boolean) => Promise<void>;
  // updatePinnedList: (id: string, pinned: boolean) => Promise<void>;
  updateIndexList: (id: string, index: number) => Promise<void>;
  updateTaskName: (
    task_id: string,
    task_content: string
  ) => Promise<{ error: string | null }>;
  // deleteAllTasks: () => Promise<void>;
  getTaskCountByListId: (listId: string) => number;
};

const calculateNewIndex = (lists: ListsType[]) =>
  lists.length > 0
    ? Math.max(...lists.map((l) => l.index ?? 0)) + POS_INDEX
    : POS_INDEX;

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
  console.log(err);
}

export const useTodoDataStore = create<TodoStore>()((set, get) => ({
  lists: [],
  tasks: [],
  loadingQueue: 0,
  user: null,

  setLists: async (list) => {
    set(() => ({ lists: list }));
  },

  getLists: async () => {
    set((state) => ({ ...state, loadingQueue: state.loadingQueue + 1 }));

    const { data, error } = await getLists();

    if (error) {
      handleError(error);
      set((state) => ({ loadingQueue: state.loadingQueue - 1 }));
      return;
    }

    set(() => ({ lists: data?.lists, tasks: data?.tasks, user: data?.user }));
    set((state) => ({ ...state, loadingQueue: state.loadingQueue - 1 }));
  },

  getTaskCountByListId: (listId: string) => {
    return get().tasks.filter((task) => task.list_id === listId).length;
  },

  getListById: (list_id: string) => {
    return get().lists.find((list) => list.list_id === list_id);
  },

  subscriptionAddList: (list) => {
    set((state) => {
      const listExists = state.lists.some((l) => l.list_id === list.list_id);

      if (listExists) {
        return {
          lists: state.lists.map((item) =>
            item.list_id === list.list_id ? list : item
          ),
        };
      } else {
        return {
          lists: [...state.lists, list],
        };
      }
    });
  },

  subscriptionDeleteList: (listId) => {
    set((state) => ({
      lists: state.lists.filter((list) => list.list_id !== listId),
      tasks: state.tasks.filter((task) => task.list_id !== listId),
    }));
  },

  subscriptionUpdateList: (updatedList) => {
    set((state) => ({
      lists: state.lists.map((currentItem) =>
        currentItem.list.list_id === updatedList.list_id
          ? { ...currentItem, list: updatedList }
          : currentItem
      ),
    }));
  },

  subscriptionUpdateMembership: (updatedMembership) => {
    set((state) => ({
      lists: state.lists.map((currentItem) =>
        currentItem.list_id === updatedMembership.list_id
          ? { ...currentItem, ...updatedMembership }
          : currentItem
      ),
    }));
  },

  updateIndexList: async (id, index) => {
    const originalList = get().lists.find((list) => list.list_id === id);
    if (!originalList) return;
    const previousIndex = originalList.index;

    set((state) => ({
      lists: state.lists.map((currentItem) =>
        currentItem.list_id === id ? { ...currentItem, index } : currentItem
      ),
    }));

    const { error } = await updateIndexList(id, index);

    if (error) {
      handleError(error);

      set((state) => ({
        lists: state.lists.map((currentItem) =>
          currentItem.list_id === id
            ? { ...currentItem, index: previousIndex }
            : currentItem
        ),
      }));
    }
  },

  insertList: async (name, color, icon) => {
    const prevLists = get().lists.slice();

    const optimisticId = uuidv4();
    const newIndex = calculateNewIndex(prevLists);
    const now = new Date().toISOString();

    const currentUserId = "";

    const optimistic: ListsType = {
      index: newIndex,
      list_id: optimisticId,
      pinned: false,
      role: "owner",
      shared_by: null,
      shared_since: now,
      status: "accepted",
      user_id: currentUserId,
      list: {
        color,
        created_at: now,
        icon: icon ?? null,
        list_id: optimisticId,
        list_name: name,
        owner_id: currentUserId,
        updated_at: null,
      },
    };

    set((state) => ({ lists: [...state.lists, optimistic] }));

    const { data, error } = await insertList(
      optimisticId,
      name,
      color,
      icon,
      newIndex
    );

    if (error) {
      handleError(error);
      set({ lists: prevLists });
      return;
    }
  },

  deleteList: async (list_id) => {
    const prevLists = get().lists.slice();
    const prevTasks = get().tasks.slice();

    set((state) => ({
      lists: state.lists.filter((l) => l.list_id !== list_id),
      tasks: state.tasks.filter((t) => t.list_id !== list_id),
    }));

    const result = await deleteList(list_id);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists, tasks: prevTasks });
      return;
    }
  },

  updateDataList: async (list_id, list_name, color, icon) => {
    const prevLists = get().lists.slice();

    set((state) => ({
      lists: state.lists.map((list) =>
        list.list_id === list_id
          ? {
              ...list,
              list: {
                ...list.list,
                list_name: list_name,
                color: color,
                icon: icon,
              },
            }
          : list
      ),
    }));

    const result = await updateDataList(list_id, list_name, color, icon);

    if (result?.error) {
      handleError(result.error);
      set({ lists: prevLists });
      return { error: result.error };
    }

    return { error: null };
  },

  deleteAllLists: async () => {
    const { error } = await deleteAllLists();

    if (error) {
      handleError(error);
      return;
    }

    set({ lists: [], tasks: [] });
  },

  //TASKS ACTIONS
  addTask: async (list_id, task_content, target_date) => {
    const optimisticId = uuidv4();

    const user = get().user;

    if (!user) {
      const errorMsg =
        "No se puede crear la tarea: el usuario no está autenticado.";
      console.error(errorMsg);
      return { error: errorMsg };
    }

    const optimisticTask = {
      task_id: optimisticId,
      task_content,
      list_id,
      target_date,
      completed: false,
      index: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: {
        user_id: user.user_id,
        display_name: user.display_name,
        username: user.username,
        avatar_url: user.avatar_url,
      },
      description: "",
    };

    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: [optimisticTask, ...state.tasks],
    }));

    const { data, error } = await insertTask(
      list_id,
      task_content,
      optimisticId,
      target_date
    );

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return { error };
    }

    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.task_id === optimisticId ? { ...t, ...data } : t
      ),
    }));

    return { error: null };
  },

  // //ACCIONES DE TAREAS

  deleteTask: async (task_id) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.filter((t) => t.task_id !== task_id),
    }));

    const { error } = await deleteTask(task_id);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return;
    }
  },

  updateTaskCompleted: async (task_id, completed) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id ? { ...task, completed: completed } : task
      ),
    }));

    const { error } = await updateCompletedTask(task_id, completed);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return;
    }
  },

  updateTaskName: async (task_id, task_content) => {
    const prevTasks = get().tasks.slice();

    set((state) => ({
      tasks: state.tasks.map((task) =>
        task.task_id === task_id
          ? { ...task, task_content: task_content }
          : task
      ),
    }));

    const { error } = await updateNameTask(task_id, task_content);

    if (error) {
      handleError(error);
      set({ tasks: prevTasks });
      return { error: error };
    }

    return { error: null };
  },

  // deleteAllTasks: async () => {
  //   const originalTasks = get().tasks;
  //   await createCRUDHandler(z.void()).interact(
  //     undefined,
  //     {
  //       optimisticUpdate: (draft) => {
  //         draft.tasks = [];
  //       },
  //       apiCall: async () => {
  //         const { error } = await deleteAllTasks();
  //         if (error) throw new Error(error);
  //       },
  //       rollback: () => set({ tasks: originalTasks }),
  //     },
  //     set
  //   );
  // },

  // getTaskCountByListId: (listId: string) => {
  //   return get().tasks.filter((task) => task.category_id === listId).length;
  // },
}));
