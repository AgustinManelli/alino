"use client";

import { create } from "zustand";
import { toast } from "sonner";

import { getStats, getUpcomingTasks } from "@/lib/api/task/actions";
import { TaskType, AppUpdatesType} from "@/lib/schemas/database.types";
import { getAppUpdates } from "@/lib/api/app-updates/actions";

type HourlyData = {
  time: string;
  temperature: number;
  weatherCode: number;
  emoji: React.ReactNode;
  isDay: boolean;
};

type WeatherState = {
  temperature: number | null;
  tempMin: number | null;
  tempMax: number | null;
  description: string | null;
  emoji: React.ReactNode | null;
  location: string | null;
  loading: boolean;
  error: string | null;
  weatherType:
    | "sunny"
    | "cloudy-day"
    | "cloudy-night"
    | "rainy"
    | "rainy-day"
    | "rainy-night"
    | "stormy"
    | "snowy"
    | "foggy"
    | "night"
    | "default";
  hourlyForecast: HourlyData[];
};

type UserData = {
  total_tasks: number;
  pending_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  fetchStats: boolean;
  upcoming_tasks: TaskType[];
  fetchUpcomingTasks: boolean;
  app_updates: AppUpdatesType[];
  fetchAppUpdates: boolean;
  weather: WeatherState;
  getStats: () => Promise<void>;
  getUpcomingTasks: () => Promise<void>;
  getAppUpdates: () => Promise<void>;
  setWeather: (data: WeatherState) => void;
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
  app_updates: [],
  fetchAppUpdates: false,
  weather: {
    temperature: null,
    tempMin: null,
    tempMax: null,
    description: null,
    emoji: null,
    location: null,
    loading: true,
    error: null,
    weatherType: "default",
    hourlyForecast: [],
  },
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
  getAppUpdates: async () => {
    if (get().fetchAppUpdates) return
    try {
    const { data, error } = await getAppUpdates();
    
    if (error) {
      throw new Error(error);
    }

      set(() => ({ app_updates: data, fetchAppUpdates: true}));
    } catch (err) {
      handleError(err);
    }
  },
  setWeather : (data) => {
    set(() => ({ weather: data}));
  }
}));
