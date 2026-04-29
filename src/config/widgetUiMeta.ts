/**
 * widgetUiMeta.ts
 *
 * Metadatos de presentación (UI) para cada widget predefinido.
 * Indexados por `component_key` (mismo valor que predefined_widgets.component_key).
 *
 * Para agregar un widget nuevo: añadir una entrada aquí.
 * HomeDashboard/index.tsx NO necesita modificarse.
 */

import React from "react";
import {
  TaskDoneIcon,
  Calendar,
  Information,
  Clock,
  IAStars,
  Cloud,
  StreakFlameIcon,
} from "@/components/ui/icons/icons";

export interface WidgetUiMeta {
  /** Icono que se muestra en el header del bento item */
  icon: React.ReactNode;
  /** Color de acento del widget (hex o cualquier valor CSS válido) */
  color: string;
  /** Si true, el widget no muestra el header superior con título e icono */
  withoutHeader?: boolean;
  /** Si true, no añade padding-top al contenido del bento item */
  withoutTopPadding?: boolean;
  /** Si true, el contenido del widget es scrollable */
  scrollable?: boolean;
  /** Ancho relativo del widget en el grid (por defecto 1, ej. 2 para ancho doble) */
  colSpan?: number;
}

const WIDGET_UI_META: Record<string, WidgetUiMeta> = {
  summary: {
    icon: React.createElement(TaskDoneIcon),
    color: "#00b7ff",
  },
  "upcoming-tasks": {
    icon: React.createElement(Calendar),
    color: "#b700ff",
    scrollable: true,
    colSpan: 2
  },
  weather: {
    icon: React.createElement(Cloud, { style: { width: "16px" } }),
    color: "#64748b",
    withoutHeader: true,
    withoutTopPadding: true,
  },
  "new-features": {
    icon: React.createElement(Information),
    color: "#10b981",
  },
  pomodoro: {
    icon: React.createElement(Clock),
    color: "#f59e0b",
    withoutHeader: true,
    withoutTopPadding: true,
  },
  "ai-planner": {
    icon: React.createElement(IAStars),
    color: "#ec4899",
  },
  "weekly-activity": {
    icon: React.createElement(TaskDoneIcon),
    color: "#ff9900ff",
    // colSpan: 2,
  },
  streak: {
    icon: React.createElement(StreakFlameIcon),
    color: "#f97316",
  },
};

export default WIDGET_UI_META;
