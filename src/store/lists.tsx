"use client";

import { create } from "zustand";
import { Database } from "@/lib/todosSchema";
import {
  DeleteListToDB,
  GetSubjects,
  UpdateDataListToDB,
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
  setAddList: (color: string, index: number, name: string) => void;
  deleteList: (id: string) => void;
  getLists: () => void;
  changeColor: (data: dataList, color: string, id: string) => void;
};

export const useLists = create<todo_list>()((set, get) => ({
  lists: [],
  setLists: (list) => set(() => ({ lists: list })),
  setAddList: async (color, index, name) => {
    const result = await AddListToDB(color, index, name);
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
  changeColor: async (data, color, id) => {
    await UpdateDataListToDB(data, color, id);
    const { lists } = get();
  },
}));
