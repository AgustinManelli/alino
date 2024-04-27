"use client";

import { create } from "zustand";
import { TasksSchema } from "@/lib/tasks-schema";
import { AddTaskToDB, GetTasks } from "@/lib/todo/actions";

type SubjectsType = TasksSchema["public"]["Tables"]["todo"]["Row"];

type Tasks = {
  tasks: SubjectsType[];
  setTasks: (subject: SubjectsType[]) => void;
  setAddTask: (
    task: string,
    status: boolean,
    priority: number,
    id: string
  ) => void;
  deleteTasks: (id: number) => void;
  getTasks: () => void;
};

export const useTodo = create<Tasks>()((set, get) => ({
  tasks: [],
  setTasks: (task) => set(() => ({ tasks: task })),
  setAddTask: async (task, status, priority, id) => {
    const result = await AddTaskToDB(task, status, priority, id);
    if (!result?.error) {
      const data = result?.data;
      set((state: any) => ({ tasks: [...state.tasks, data] }));
    }
  },
  deleteTasks: (id) => {
    const { tasks } = get();
    const filtered = [...tasks].filter((all) => all.id !== id);
    set(() => ({ tasks: filtered }));
  },
  getTasks: async () => {
    const { data } = (await GetTasks()) as any;
    set(() => ({ tasks: data }));
  },
}));
