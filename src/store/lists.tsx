"use client";

import { create } from "zustand";
import { Database, tasks } from "@/lib/todosSchema";
import {
  AddTaskToDB,
  DeleteListToDB,
  DeleteTaskToDB,
  GetSubjects,
  UpdateDataListToDB,
  UpdateTasksCompleted,
} from "@/lib/todo/actions";
import { AddListToDB } from "@/lib/todo/actions";
import { toast } from "sonner";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

type todo_list = {
  lists: ListsType[];
  tasks: tasks[];
  setLists: (list: ListsType[]) => void;
  setAddList: (color: string, name: string, shortcodeemoji: string) => void;
  deleteList: (id: string) => void;
  getLists: () => void;
  changeColor: (color: string, id: string, shortcodeemoji: string) => void;
  addTask: (list_id: string, task: string) => void;
  deleteTask: (id: string, list_id: string) => void;
  updateTaskCompleted: (id: string, list_id: string, status: boolean) => void;
};

export const useLists = create<todo_list>()((set, get) => ({
  lists: [],
  tasks: [],
  setLists: (list) => {
    set(() => ({ lists: list }));
  },

  setAddList: async (color, name, shortcodeemoji) => {
    const result = await AddListToDB(color, name, shortcodeemoji);
    if (!result.error) {
      const data = result?.data;
      const final = { ...data, tasks: [] };
      set((state: any) => ({ lists: [...state.lists, final] }));
    } else {
      toast(result.error.toString());
    }
  },

  deleteList: async (id) => {
    const { lists } = get();
    const filtered = lists.filter((all) => all.id !== id);
    set(() => ({ lists: filtered }));
    await DeleteListToDB(id);
  },

  getLists: async () => {
    const { data } = (await GetSubjects()) as any;
    set(() => ({ lists: data }));
  },

  changeColor: async (color, id, shortcodeemoji) => {
    await UpdateDataListToDB(color, id, shortcodeemoji);
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === id) {
          return {
            ...list,
            color: color,
            icon: shortcodeemoji,
          };
        }
        return list;
      }),
    }));
  },

  addTask: async (list_id, task) => {
    const result = await AddTaskToDB(list_id, task);
    const data = result?.data;
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: [...list.tasks, data],
          };
        }
        return list;
      }),
    }));
  },

  deleteTask: async (id, list_id) => {
    await DeleteTaskToDB(id);
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: list.tasks.filter((task) => task.id !== id),
          };
        }
        return list;
      }),
    }));
  },

  updateTaskCompleted: async (id, list_id, status) => {
    UpdateTasksCompleted(id, status);
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === list_id) {
          return {
            ...list,
            tasks: list.tasks.map((task) => {
              if (task.id === id) {
                return {
                  ...task,
                  completed: status,
                };
              }
              return task;
            }),
          };
        }
        return list;
      }),
    }));
  },
}));
