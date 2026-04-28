"use client"

import { create } from "zustand";
import { ResponsiveLayouts } from "react-grid-layout";

import {
  AppUpdatesType,
  DashboardData,
} from "@/lib/schemas/database.types";
import {
  PredefinedWidget,
  WidgetInstance,
} from "@/lib/schemas/dashboard.types";
import { WidgetLimits } from "@/lib/schemas/dashboard.types";

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

type DashboardStore = {
  widgetInstances: WidgetInstance[];
  predefinedWidgets: PredefinedWidget[];
  activeWidgets: string[];
  layout: ResponsiveLayouts;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  upcoming_tasks: DashboardData["upcoming_tasks"];
  due_today_tasks: DashboardData["due_today_tasks"];
  app_updates: AppUpdatesType[];
  weather: WeatherState;
  isConfigLoaded: boolean;
  isFetchingData: boolean;
  isFetchingAppUpdates: boolean;
  hasFetchedData: boolean;
  hasFetchedAppUpdates: boolean;
  widgetLimits: WidgetLimits;
  setDashboardData: (data: Partial<DashboardStore>) => void;
  setWidgetInstances: (instances: WidgetInstance[]) => void;
  setLayout: (layout: ResponsiveLayouts) => void;
  setActiveWidgets: (widgets: string[]) => void;
  setWeather: (data: WeatherState) => void;
  invalidateDashboardData: () => void;
};

export const useDashboardStore = create<DashboardStore>()((set) => ({
  widgetInstances: [],
  predefinedWidgets: [],
  activeWidgets: [],
  layout: { lg: [], md: [], xs: [] },
  total_tasks: 0,
  pending_tasks: 0,
  completed_tasks: 0,
  overdue_tasks: 0,
  upcoming_tasks: [],
  due_today_tasks: [],
  app_updates: [],
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
  isConfigLoaded: false,
  isFetchingData: false,
  isFetchingAppUpdates: false,
  hasFetchedData: false,
  hasFetchedAppUpdates: false,
  widgetLimits: { free: 1, student: 3, pro: 99, ultra: 99 },

  setDashboardData: (data) => set((state) => ({ ...state, ...data })),
  
  setWidgetInstances: (instances) => set({ widgetInstances: instances }),
  
  setLayout: (layout) => set({ layout }),

  setActiveWidgets: (widgets) => set({ activeWidgets: widgets }),

  setWeather: (data) => set({ weather: data }),

  invalidateDashboardData: () =>
    set({
      total_tasks: 0,
      completed_tasks: 0,
      overdue_tasks: 0,
      upcoming_tasks: [],
      due_today_tasks: [],
      isFetchingData: false,
    }),
}));