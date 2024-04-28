"use client";

import { create } from "zustand";
import { TasksHomeSchema } from "@/lib/tasks-home-schema";
import { AddTaskHomeToDB } from "@/lib/todo/actions";

type SubjectsType = TasksHomeSchema["public"]["Tables"]["todo"]["Row"];

type Tasks = {
  tasksHome: SubjectsType[];
  setTasksHome: (subject: SubjectsType[]) => void;
  setAddTaskHome: (task: string, status: boolean, priority: number) => void;
  deleteTasksHome: (id: string) => void;
};

export const useTodoHome = create<Tasks>()((set, get) => ({
  tasksHome: [],
  setTasksHome: (task) => set(() => ({ tasksHome: task })),
  setAddTaskHome: async (task, status, priority) => {
    const result = await AddTaskHomeToDB(task, status, priority);
    if (!result?.error) {
      const data = result?.data;
      set((state: any) => ({ tasksHome: [...state.tasksHome, data] }));
    }
  },
  deleteTasksHome: (id) => {
    const { tasksHome } = get();
    const filtered = [...tasksHome].filter((all) => all.id !== id);
    set(() => ({ tasksHome: filtered }));
  },
}));
