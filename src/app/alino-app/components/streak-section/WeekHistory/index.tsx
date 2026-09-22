"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import { useTranslation } from "react-i18next";
import { DayHistory } from "@/hooks/dashboard/useStreak";
import { FreezeDayIcon } from "@/components/ui/icons/icons";
import {
  getDayAbbrev,
  getDayCircleClass,
  getDayCircleContent,
  getTooltip,
} from "../streakUtils";
import styles from "./WeekHistory.module.css";

export type WeekDayItem = {
  date?: string;
  day?: string;
  event_type: DayHistory["event_type"];
  streak_after?: number | null;
  free_protectors_used?: number;
  purchased_protectors_used?: number;
};

export interface WeekHistoryProps {
  days?: (DayHistory | WeekDayItem)[];
  isLoading?: boolean;
  className?: string;
  localizedDays?: string[];
}

export const WeekHistory: React.FC<WeekHistoryProps> = ({
  days,
  isLoading = false,
  className,
  localizedDays,
}) => {
  const { t } = useTranslation(["streak"]);

  const defaultLocalizedDays = useMemo(() => {
    if (localizedDays) return localizedDays;
    const daysTranslation = t("streak:history.days", { returnObjects: true });
    return Array.isArray(daysTranslation) ? (daysTranslation as string[]) : undefined;
  }, [localizedDays, t]);

  const streakGroups = useMemo(() => {
    if (!days || days.length === 0) return [];
    const groups: { start: number; end: number }[] = [];
    let current: { start: number; end: number } | null = null;

    days.forEach((day, i) => {
      const isStreak =
        day.event_type === "extended" || day.event_type === "started";
      if (isStreak) {
        if (!current) {
          current = { start: i, end: i };
        } else {
          current.end = i;
        }
      } else {
        if (current) {
          groups.push(current);
          current = null;
        }
      }
    });

    if (current) {
      groups.push(current);
    }
    return groups;
  }, [days]);

  if (!days || days.length === 0) {
    if (!isLoading) return null;
    return (
      <div className={`${styles.weekHistorySkeleton} ${className ?? ""}`}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className={styles.dayItem}>
            <div className={`${styles.dayCircle} ${styles.circleSkeleton}`} />
            <span className={styles.dayLabelSkeleton} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`${styles.weekHistory} ${className ?? ""}`}>
      <div className={styles.barsContainer}>
        {streakGroups.map((g) => {
          const startPercent = ((g.start + 0.5) / 7) * 100;
          const endPercent = ((g.end + 0.5) / 7) * 100;
          const left = `calc(${startPercent}% - 14px)`;
          const width = `calc(${endPercent - startPercent}% + 28px)`;
          return (
            <motion.div
              key={g.start}
              initial={{ width: "28px" }}
              animate={{ width }}
              transition={{ type: "spring", stiffness: 140, damping: 18 }}
              className={styles.animatedBar}
              style={{ left }}
            />
          );
        })}
      </div>
      {days.map((day, i) => {
        const isProtected = day.event_type.startsWith("protected_");
        const label =
          ("day" in day && day.day)
            ? day.day
            : (day.date ? getDayAbbrev(day.date, defaultLocalizedDays) : "");
        const tooltip = day.date ? getTooltip(day as DayHistory, t) : undefined;

        return (
          <div key={i} className={styles.dayItem} title={tooltip}>
            {isProtected ? (
              <div
                className={styles.dayCircle}
                style={{
                  position: "relative",
                  border: "none",
                  background: "transparent",
                }}
              >
                <FreezeDayIcon
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -41.77%)",
                    width: 30,
                    height: 40,
                    zIndex: 2,
                  }}
                />
              </div>
            ) : (
              <div
                className={`${styles.dayCircle} ${getDayCircleClass(day.event_type, styles)}`}
              >
                <span className={styles.dayCircleContent}>
                  {getDayCircleContent(day.event_type)}
                </span>
              </div>
            )}
            <span
              className={`${styles.dayLabel} ${day.event_type === "today" ? styles.dayLabelToday : ""}`}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
