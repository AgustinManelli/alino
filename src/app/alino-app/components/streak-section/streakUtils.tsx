"use client";

import { DayHistory } from "@/hooks/dashboard/useStreak";
import { TickIcon } from "@/components/ui/icons/icons";
import React from "react";

export const SPANISH_DAY_ABBREV = ["D", "L", "M", "X", "J", "V", "S"];

export const getDayAbbrev = (dateStr: string): string => {
  const date = new Date(dateStr + "T12:00:00");
  return SPANISH_DAY_ABBREV[date.getDay()];
};

export const getDayCircleClass = (
  eventType: DayHistory["event_type"],
  styles: { [key: string]: string },
): string => {
  switch (eventType) {
    case "extended":
    case "started":
      return styles.circleActive;
    case "protected_free":
    case "protected_purchased":
    case "protected_mixed":
      return styles.circleProtected;
    case "lost":
      return styles.circleLost;
    case "today":
      return styles.circleToday;
    case "missed":
    default:
      return styles.circleMissed;
  }
};

export const getDayCircleContent = (
  eventType: DayHistory["event_type"],
): React.ReactNode => {
  switch (eventType) {
    case "extended":
    case "started":
      return (
        <TickIcon
          style={{ width: 14, height: 14, color: "#fff", strokeWidth: 4 }}
        />
      );
    case "protected_free":
    case "protected_purchased":
    case "protected_mixed":
      return "❄";
    default:
      return null;
  }
};

export const getTooltip = (day: DayHistory): string => {
  switch (day.event_type) {
    case "started":
      return `Racha iniciada (→ ${day.streak_after} días)`;
    case "extended":
      return `Racha extendida (→ ${day.streak_after} días)`;
    case "protected_free":
      return `Protegida con ${day.free_protectors_used} protector${day.free_protectors_used > 1 ? "es" : ""} gratuito${day.free_protectors_used > 1 ? "s" : ""}`;
    case "protected_purchased":
      return `Protegida con ${day.purchased_protectors_used} protector${day.purchased_protectors_used > 1 ? "es" : ""} comprado${day.purchased_protectors_used > 1 ? "s" : ""}`;
    case "protected_mixed":
      return `Protegida (${day.free_protectors_used} gratuito + ${day.purchased_protectors_used} comprado)`;
    case "lost":
      return "Racha perdida";
    case "today":
      return "Completá una tarea hoy";
    case "missed":
      return "Sin actividad";
    default:
      return "";
  }
};
