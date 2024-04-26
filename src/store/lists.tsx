"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";
import { DeleteSubjectToDB, GetSubjects } from "@/lib/todo/actions";
import { UpdateSubjectToDB } from "@/lib/todo/actions";
import { AddSubjectToDB } from "@/lib/todo/actions";

type ListsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  lists: ListsType[];
  setLists: (list: ListsType[]) => void;
  setAddList: (value: string, color: string) => void;
  deleteList: (id: string) => void;
  getLists: () => void;
  changeColor: (id: string, newColor: string) => void;
};

export const useLists = create<Subjects>()((set, get) => ({
  lists: [],
  setLists: (list) => set(() => ({ lists: list })),
  setAddList: async (value, color) => {
    const result = await AddSubjectToDB(value, color);
    const data = result?.data;
    const { lists } = get();
    const addElement = [...lists, data] as ListsType[];
    set(() => ({ lists: addElement }));
  },
  deleteList: async (id) => {
    const { lists } = get();
    const filtered = lists.filter((all) => all.id !== id);
    set({ lists: filtered });
    await DeleteSubjectToDB(id);
  },
  getLists: async () => {
    const { data } = (await GetSubjects()) as any;
    set({ lists: data });
  },
  changeColor: async (id, newColor) => {
    await UpdateSubjectToDB(id, newColor);
    const { lists } = get();
    const flag = lists;
    for (const object of flag) {
      if (object.id === id) {
        object.color = newColor;
      }
    }
    set({ lists: flag });
  },
}));
