/**
 * widgetComponents.ts
 *
 * Registro centralizado de componentes de widgets predefinidos.
 *
 * Para agregar un widget nuevo:
 *   1. Crear el componente en HomeDashboard/parts/<NombreWidget>/
 *   2. Añadir una entrada aquí con la misma clave que en predefined_widgets.component_key
 *   3. Añadir sus metadatos UI en widgetUiMeta.ts
 *
 */

import dynamic from "next/dynamic";
import type { ComponentType } from "react";

export type WidgetComponentMap = Record<string, ComponentType<any>>;

const WIDGET_COMPONENTS: WidgetComponentMap = {
  summary: dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/Summary").then((m) => m.Summary),
    { ssr: false },
  ),
  "upcoming-tasks": dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/UpcomingTasks").then((m) => m.UpcomingTask),
    { ssr: false },
  ),
  weather: dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/Weather").then((m) => m.Weather),
    { ssr: false },
  ),
  "new-features": dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/NewFeatures").then((m) => m.NewFeature),
    { ssr: false },
  ),
  pomodoro: dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/Pomodoro").then((m) => m.Pomodoro),
    { ssr: false },
  ),
  "ai-planner": dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/AIAssistantWidget").then((m) => m.default),
    { ssr: false },
  ),
  "weekly-activity": dynamic(
    () => import("@/app/alino-app/components/todo/HomeDashboard/parts/WeeklyActivity").then((m) => m.WeeklyActivity),
    { ssr: false },
  ),
};

export default WIDGET_COMPONENTS;
