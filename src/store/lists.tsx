"use client";

import { create } from "zustand";
import { Database } from "@/lib/todosSchema";
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

type dataList = {
  url: string;
  icon: string;
  type: string;
  color: string;
};

type todo_list = {
  lists: ListsType[];
  setLists: (list: ListsType[]) => void;
  setAddList: (
    color: string,
    index: number,
    name: string,
    shortcodeemoji: string
  ) => void;
  deleteList: (id: string) => void;
  getLists: () => void;
  changeColor: (
    data: dataList,
    color: string,
    id: string,
    shortcodeemoji: string
  ) => void;
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
  setAddList: async (color, index, name, shortcodeemoji) => {
    const { lists } = get();
    const result = await AddListToDB(color, index, name, lists, shortcodeemoji);
    if (result) {
      if (!result.error) {
        const data = result?.data;
        set((state: any) => ({ lists: [...state.lists, data] }));
      } else {
        toast(result.error.toString());
      }
    } else {
      toast("ya hay una lista con ese nombre");
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
  changeColor: async (data, color, id, shortcodeemoji) => {
    await UpdateDataListToDB(data, color, id, shortcodeemoji);
    set((state) => ({
      lists: state.lists.map((list) => {
        if (list.id === id) {
          return {
            ...list,
            data: { ...list.data, color: color, icon: shortcodeemoji },
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
