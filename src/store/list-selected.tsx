"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/todosSchema";

type listType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type List = {
  listSelected: listType;
  setListSelected: (list: listType) => void;
  setColorListSelected: (color: string) => void;
};

export const useListSelected = create<List>()((set, get) => ({
  listSelected: {
    id: "home-tasks-static-alino-app",
    user_id: "",
    subject: "home",
    color: "#87189d",
    inserted_at: "",
  },
  setListSelected: (list) =>
    set((state: any) => ({ listSelected: { ...state.lists, ...list } })),
  setColorListSelected: (color) => {
    const { listSelected } = get();
    const flag = { ...listSelected };
    flag.color = color;

    set((state: any) => ({ listSelected: { ...state.listSelected, ...flag } }));
  },
}));
