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
  deleteTask: (id: string, category_id: string) => void;
  updateTaskCompleted: (
    id: string,
    category_id: string,
    status: boolean
  ) => void;
};

export const useLists = create<todo_list>()((set, get) => ({
  lists: [],
  setLists: (list) => set(() => ({ lists: list })),
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
    const { lists } = get();
    const tempLists = [...lists];
    for (const element of tempLists) {
      if (element.id === id) {
        element.data.color = color;
      }
    }
    set(() => ({ lists: tempLists }));
  },
  addTask: async (list_id, task) => {
    const result = await AddTaskToDB(list_id, task);
    const { lists } = get();

    const tempLists = [...lists];
    const indexList = tempLists.findIndex((list) => list.id === list_id);
    if (indexList !== -1) {
      tempLists[indexList].tasks?.push(result?.data);
    }

    set(() => ({ lists: tempLists }));
  },
  deleteTask: async (id, category_id) => {
    await DeleteTaskToDB(id);
    const { lists } = get();

    const tempLists = [...lists];
    const indexList = tempLists.findIndex((list) => list.id === category_id);
    if (indexList !== -1) {
      const filtered = tempLists[indexList].tasks?.filter(
        (task) => task.id !== id
      );
      tempLists[indexList].tasks = filtered as tasks[];
    }

    set(() => ({ lists: tempLists }));
  },
  updateTaskCompleted: async (id, category_id, status) => {
    const { lists } = get();

    UpdateTasksCompleted(id, status);

    const tempLists = [...lists];
    const element = tempLists
      .find((list) => list.id === category_id)
      ?.tasks.find((task) => task.id === id);
    if (element) {
      element.completed = status;
    }
    set(() => ({ lists: tempLists }));
  },
}));
