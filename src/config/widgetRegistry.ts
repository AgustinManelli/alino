import dynamic from "next/dynamic";
import type { ComponentType } from "react";
import type { WidgetProps, CompanionProps } from "@/types/widgetContract";
import type { WidgetManifest } from "@/types/widgetContract";

export type WidgetComponentMap = Record<string, ComponentType<WidgetProps>>;
export type CompanionComponentMap = Record<
  string,
  ComponentType<CompanionProps>
>;
export type PreviewComponentMap = Record<string, ComponentType<unknown>>;

export const WIDGET_MANIFESTS: Record<string, WidgetManifest> = {
  summary: {
    id: "summary",
    componentKey: "summary",
    category: "productivity",
    tierRequired: "free",
    defaultDimensions: { w: 1, h: 2 },
    nameKey: "widgets.summary.name",
    descriptionKey: "widgets.summary.description",
  },
  "upcoming-tasks": {
    id: "upcoming-tasks",
    componentKey: "upcoming-tasks",
    category: "productivity",
    tierRequired: "free",
    defaultDimensions: { w: 2, h: 3 },
    nameKey: "widgets.upcomingTasks.name",
    descriptionKey: "widgets.upcomingTasks.description",
  },
  "new-features": {
    id: "new-features",
    componentKey: "new-features",
    category: "info",
    tierRequired: "free",
    defaultDimensions: { w: 1, h: 2 },
    nameKey: "widgets.newFeatures.name",
    descriptionKey: "widgets.newFeatures.description",
    onlineOnly: true,
  },
  pomodoro: {
    id: "pomodoro",
    componentKey: "pomodoro",
    category: "wellness",
    tierRequired: "free",
    defaultDimensions: { w: 1, h: 2 },
    nameKey: "widgets.pomodoro.name",
    descriptionKey: "widgets.pomodoro.description",
  },
  "ai-planner": {
    id: "ai-planner",
    componentKey: "ai-planner",
    category: "productivity",
    tierRequired: "pro",
    defaultDimensions: { w: 1, h: 3 },
    nameKey: "widgets.aiPlanner.name",
    descriptionKey: "widgets.aiPlanner.description",
    onlineOnly: true,
  },
  "weekly-activity": {
    id: "weekly-activity",
    componentKey: "weekly-activity",
    category: "productivity",
    tierRequired: "free",
    defaultDimensions: { w: 1, h: 2 },
    nameKey: "widgets.weeklyActivity.name",
    descriptionKey: "widgets.weeklyActivity.description",
  },
  streak: {
    id: "streak",
    componentKey: "streak",
    category: "wellness",
    tierRequired: "free",
    defaultDimensions: { w: 1, h: 2 },
    nameKey: "widgets.streak.name",
    descriptionKey: "widgets.streak.description",
    onlineOnly: true,
  },
  achievements: {
    id: "achievements",
    componentKey: "achievements",
    category: "productivity",
    tierRequired: "free",
    defaultDimensions: { w: 1, h: 2 },
    nameKey: "widgets.achievements.name",
    descriptionKey: "widgets.achievements.description",
    onlineOnly: true,
  },
};

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
      import("@/app/alino-app/components/todo/HomeDashboard/parts/Streak").then(
        (m) => m.StreakWidget,
      ),
    { ssr: false },
  ),
  achievements: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/UpcomingAchievements"
      ).then((m) => m.UpcomingAchievementsWidget),
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
  achievements: dynamic(
    () =>
      import(
        "@/app/alino-app/components/todo/HomeDashboard/parts/UpcomingAchievements/UpcomingAchievementsPreview"
      ).then((m) => m.UpcomingAchievementsPreview),
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

export const getWidgetManifest = (key: string): WidgetManifest | null => {
  return WIDGET_MANIFESTS[key] ?? null;
};

export default WIDGET_COMPONENTS;
