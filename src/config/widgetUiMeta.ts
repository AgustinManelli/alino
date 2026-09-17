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
  icon: React.ReactNode;
  color: string;
  withoutHeader?: boolean;
  withoutTopPadding?: boolean;
  scrollable?: boolean;
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
    colSpan: 2,
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
  },
  streak: {
    icon: React.createElement(StreakFlameIcon),
    color: "#f97316",
  },
};

export default WIDGET_UI_META;
