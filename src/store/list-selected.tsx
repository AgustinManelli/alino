"use client";

import { create } from "zustand";
import { SubjectSchema } from "@/lib/subject-schema";

type listType = SubjectSchema["public"]["Tables"]["subjects"]["Row"];

type List = {
  listSelected: listType;
  setListSelected: (list: listType) => void;
};

export const useListSelected = create<List>()((set) => ({
  listSelected: {
    id: "home-tasks-static-alino-app",
    user_id: "",
    subject: "home",
    color: "#87189d",
    inserted_at: "",
  },
  setListSelected: (list) => set(() => ({ listSelected: list })),
}));
