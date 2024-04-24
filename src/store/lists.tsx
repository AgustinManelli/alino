"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";
import { DeleteSubjectToDB, GetSubjects } from "@/lib/todo/actions";

type ListsType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type Subjects = {
  lists: ListsType[];
  setLists: (list: ListsType[]) => void;
  deleteList: (id: string) => void;
  getLists: () => void;
};

export const useLists = create<Subjects>()((set, get) => ({
  lists: [],
  setLists: (list) => set(() => ({ lists: list })),
  deleteList: async (id) => {
    await DeleteSubjectToDB(id);
    const { lists } = get();
    const filtered = lists.filter((all) => all.id !== id);
    set({ lists: filtered });
  },
  getLists: async () => {
    const { data } = (await GetSubjects()) as any;
    set({ lists: data });
  },
}));
