"use client";

import { create } from "zustand";
import { TasksHomeSchema } from "@/lib/tasks-home-schema";

type SubjectsType = TasksHomeSchema["public"]["Tables"]["todo"]["Row"];

type Tasks = {
  tasks: SubjectsType[];
  setTasks: (subject: SubjectsType[]) => void;
  deleteTasks: (id: number) => void;
};

export const useTodoHome = create<Tasks>()((set, get) => ({
  tasks: [],
  setTasks: (task) => set(() => ({ tasks: task })),
  deleteTasks: (id) => {
    const { tasks } = get();
    const filtered = tasks.filter((all) => all.id !== id);
    set({ tasks: filtered });
  },
}));
