"use client";

import { useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { useTranslation } from "react-i18next";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import styles from "./WeeklyActivity.module.css";

import { WeeklyActivityPreview } from "./WeeklyActivityPreview";

export const WeeklyActivity = () => {
  const { t, i18n } = useTranslation(["widgets"]);
  const { completedTasks, initialFetch } = useTodoDataStore(
    useShallow((state) => ({
      completedTasks: state.completedTasks,
      initialFetch: state.initialFetch,
    })),
  );
  const isPreview = useWidgetPreview();

  const weekdayFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(i18n.language || "es", {
        weekday: "short",
      }),
    [i18n.language],
  );

  const displayData = useMemo(() => {
    const countByDate = new Map<string, number>();
    for (const task of completedTasks) {
      const dateVal = task.completed_at || task.updated_at;
      if (!dateVal) continue;
      const taskDate = new Date(dateVal);
      const key = `${taskDate.getFullYear()}-${String(taskDate.getMonth() + 1).padStart(2, "0")}-${String(taskDate.getDate()).padStart(2, "0")}`;
      countByDate.set(key, (countByDate.get(key) ?? 0) + 1);
    }

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const localDateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      return {
        date: localDateStr,
        dateObj: d,
        completed_count: countByDate.get(localDateStr) ?? 0,
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

  if (isPreview) {
    return <WeeklyActivityPreview />;
  }

  return (
    <div className={styles.activityContainer}>
      <div
        className={styles.summaryText}
        style={{ opacity: initialFetch ? 1 : 0, transition: "opacity 0.3s" }}
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
