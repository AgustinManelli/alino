"use client";

import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import styles from "./WeeklyActivity.module.css";

import { WeeklyActivityPreview } from "./WeeklyActivityPreview";

export const WeeklyActivity = () => {
  const { t, i18n } = useTranslation(["widgets"]);
  const completedTasks = useTodoDataStore((state) => state.completedTasks);
  const initialFetch = useTodoDataStore((state) => state.initialFetch);
  const isPreview = useWidgetPreview();

  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language || "es", {
        weekday: "short",
      }),
    [i18n.language],
  );

  if (isPreview) {
    return <WeeklyActivityPreview />;
  }

  const displayData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const localDateStr = `${year}-${month}-${day}`;

      const count = completedTasks.filter((task) => {
        const dateVal = task.completed_at || task.updated_at;
        if (!dateVal) return false;
        const taskDate = new Date(dateVal);
        const tYear = taskDate.getFullYear();
        const tMonth = String(taskDate.getMonth() + 1).padStart(2, "0");
        const tDay = String(taskDate.getDate()).padStart(2, "0");
        return `${tYear}-${tMonth}-${tDay}` === localDateStr;
      }).length;

      return {
        date: localDateStr,
        dateObj: d,
        completed_count: count,
      };
    });
  }, [completedTasks]);

  const maxCount = useMemo(() => {
    const max = Math.max(...displayData.map((d) => d.completed_count), 0);
    return max === 0 ? 1 : max;
  }, [displayData]);

  const totalCompleted = useMemo(() => {
    return displayData.reduce((acc, curr) => acc + curr.completed_count, 0);
  }, [displayData]);

  const showStats = initialFetch;

  return (
    <div className={styles.activityContainer}>
      <div
        className={styles.summaryText}
        style={{ opacity: showStats ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {t(
          totalCompleted === 1
            ? "widgets:items.weekly-activity.summary_one"
            : "widgets:items.weekly-activity.summary_other",
          {
            count: totalCompleted,
            defaultValue: `${totalCompleted} ${totalCompleted === 1 ? "tarea completada" : "tareas completadas"} esta semana`,
          },
        )}
      </div>

      <div className={styles.chartWrapper}>
        {displayData.map((day, idx) => {
          const rawName = weekdayFormatter.format(day.dateObj);
          const cleanName = rawName.replace(".", "");
          const dayName =
            cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
          const heightPercent = (day.completed_count / maxCount) * 100;

          return (
            <div key={day.date || idx} className={styles.barGroup}>
              <div className={styles.barContainer}>
                <div
                  className={styles.bar}
                  style={{ height: `${Math.max(heightPercent, 5)}%` }}
                >
                  <span className={styles.barValue}>{day.completed_count}</span>
                </div>
              </div>
              <span className={styles.dayLabel}>{dayName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

