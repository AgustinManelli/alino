"use client";

import { create } from "zustand";
import { TasksSchema } from "@/lib/tasks-schema";

type SubjectsType = TasksSchema["public"]["Tables"]["todo"]["Row"];

type Tasks = {
  tasks: SubjectsType[];
  setTasks: (subject: SubjectsType[]) => void;
  deleteTasks: (id: number) => void;
};

export const useTodo = create<Tasks>()((set, get) => ({
  tasks: [],
  setTasks: (task) => set(() => ({ tasks: task })),
  deleteTasks: (id) => {
    const { tasks } = get();
    const filtered = tasks.filter((all) => all.id !== id);
    set({ tasks: filtered });
  },
}));
