"use client"

import { create } from "zustand";

import type { TaskSortOption } from "@/lib/schemas/todo.types";
import {
  FolderType,
  ListsType,
  TaskType,
} from "@/lib/schemas/database.types";

type TodoStore = {
  lists: ListsType[];
  tasks: TaskType[];
  tasksByList: Record<string, { tasks: TaskType[]; page: number; hasMore: boolean }>;
  folders: FolderType[];
  initialFetch: boolean;
  tasksPage: number;
  hasMoreTasks: boolean;
  currentListId: string | "home" | null;
  fetchingListsQueue: Record<string, boolean>;
  listsPagination: Record<string, { page: number; hasMore: boolean }>;
  taskSort: TaskSortOption;
  completedTasks: TaskType[];
  completedTasksPage: number;
  hasMoreCompletedTasks: boolean;
  setLists: (lists: ListsType[]) => void;
  setTasks: (tasks: TaskType[]) => void;
  setFolders: (folders: FolderType[]) => void;
  setInitialFetch: (val: boolean) => void;
  setTaskSort: (sort: TaskSortOption) => void;
  setCompletedTasks: (tasks: TaskType[]) => void;
  updateState: (partial: Partial<TodoStore>) => void;
};

export const useTodoDataStore = create<TodoStore>()((set) => ({
  lists: [],
  tasks: [],
  tasksByList: {},
  folders: [],
  initialFetch: false,
  tasksPage: -1,
  hasMoreTasks: true,
  currentListId: null,
  fetchingListsQueue: {},
  listsPagination: {},
  taskSort: "default",
  completedTasks: [],
  completedTasksPage: -1,
  hasMoreCompletedTasks: true,

  setLists: (lists) => set({ lists }),
  setTasks: (tasks) => set({ tasks }),
  setFolders: (folders) => set({ folders }),
  setInitialFetch: (initialFetch) => set({ initialFetch }),
  setTaskSort: (taskSort) => set({ taskSort }),
  setCompletedTasks: (completedTasks) => set({ completedTasks }),
  updateState: (partial) => set((state) => ({ ...state, ...partial })),
}));
