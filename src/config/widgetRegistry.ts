import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { WidgetProps, CompanionProps } from "@/types/widgetContract";

export type WidgetComponentMap = Record<string, ComponentType<WidgetProps>>;
export type CompanionComponentMap = Record<string, ComponentType<CompanionProps>>;
export type PreviewComponentMap = Record<string, ComponentType<unknown>>;

export const WIDGET_COMPONENTS: WidgetComponentMap = {
  summary: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Summary"
      ).then((m) => m.Summary),
    { ssr: false },
  ),
  "upcoming-tasks": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/UpcomingTasks"
      ).then((m) => m.UpcomingTask),
    { ssr: false },
  ),
  weather: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Weather"
      ).then((m) => m.Weather),
    { ssr: false },
  ),
  "new-features": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/NewFeatures"
      ).then((m) => m.NewFeature),
    { ssr: false },
  ),
  pomodoro: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Pomodoro"
      ).then((m) => m.Pomodoro),
    { ssr: false },
  ),
  "ai-planner": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/AIAssistantWidget"
      ).then((m) => m.default),
    { ssr: false },
  ),
  "weekly-activity": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/WeeklyActivity"
      ).then((m) => m.WeeklyActivity),
    { ssr: false },
  ),
  streak: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Streak"
      ).then((m) => m.StreakWidget),
    { ssr: false },
  ),
};

export const WIDGET_COMPANIONS: CompanionComponentMap = {
  pomodoro: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Pomodoro/MiniIndicator"
      ).then((m) => m.MiniIndicator),
    { ssr: false },
  ),
};

export const WIDGET_PREVIEWS: PreviewComponentMap = {
  summary: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Summary/SummaryPreview"
      ).then((m) => m.SummaryPreview),
    { ssr: false },
  ),
  "upcoming-tasks": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/UpcomingTasks/UpcomingTasksPreview"
      ).then((m) => m.UpcomingTasksPreview),
    { ssr: false },
  ),
  weather: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Weather/WeatherPreview"
      ).then((m) => m.WeatherPreview),
    { ssr: false },
  ),
  "new-features": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/NewFeatures/NewFeaturesPreview"
      ).then((m) => m.NewFeaturesPreview),
    { ssr: false },
  ),
  pomodoro: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Pomodoro/PomodoroPreview"
      ).then((m) => m.PomodoroPreview),
    { ssr: false },
  ),
  "ai-planner": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/AIAssistantWidget/AIAssistantWidgetPreview"
      ).then((m) => m.AIAssistantWidgetPreview),
    { ssr: false },
  ),
  "weekly-activity": dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/WeeklyActivity/WeeklyActivityPreview"
      ).then((m) => m.WeeklyActivityPreview),
    { ssr: false },
  ),
  streak: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/Streak/StreakPreview"
      ).then((m) => m.StreakPreview),
    { ssr: false },
  ),
};

export const getWidgetComponent = (
  key: string,
): ComponentType<WidgetProps> | null => {
  return WIDGET_COMPONENTS[key] ?? null;
};

export const getWidgetCompanion = (
  key: string,
): ComponentType<CompanionProps> | null => {
  return WIDGET_COMPANIONS[key] ?? null;
};

export const getWidgetPreview = (
  key: string,
): ComponentType<unknown> | null => {
  return WIDGET_PREVIEWS[key] ?? null;
};

export default WIDGET_COMPONENTS;
