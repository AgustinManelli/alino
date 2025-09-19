"use client";

import { create } from "zustand";
import { toast } from "sonner";

import { getStats, getUpcomingTasks } from "@/lib/api/actions";
import { TaskType } from "@/lib/schemas/todo-schema";

type UserData = {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  fetchStats: boolean;
  upcoming_tasks: TaskType[];
  fetchUpcomingTasks: boolean;
  getStats: () => Promise<void>;
  getUpcomingTasks: () => Promise<void>
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

export const useDashboardStore = create<UserData>()((set, get) => ({
  total_tasks: 0,
  pending_tasks: 0,
  completed_tasks: 0,
  overdue_tasks: 0,
  fetchStats: false,
  upcoming_tasks: [],
  fetchUpcomingTasks: false,
  getStats: async () => {
    if (get().fetchStats) return
    try {
    const { data, error } = await getStats();
    
    if (error) {
      throw new Error(error);
    }

      set(() => ({ total_tasks: data?.total_tasks, pending_tasks: data?.pending_tasks, completed_tasks: data?.completed_tasks, overdue_tasks: data?.overdue_tasks, fetchStats: true}));
    } catch (err) {
      handleError(err);
    }
  },
  getUpcomingTasks: async () => {
    if (get().fetchUpcomingTasks) return
    try {
    const { data, error } = await getUpcomingTasks();
    
    if (error) {
      throw new Error(error);
    }

      set(() => ({ upcoming_tasks: data, fetchUpcomingTasks: true}));
    } catch (err) {
      handleError(err);
    }
  },
}));
