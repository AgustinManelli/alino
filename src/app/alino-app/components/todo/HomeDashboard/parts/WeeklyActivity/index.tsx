"use client";

import { useEffect, useMemo } from "react";
import { useWeeklyActivity } from "@/hooks/dashboard/useWeeklyActivity";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "./WeeklyActivity.module.css";

const DAYS_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

export const WeeklyActivity = () => {
  const { data, isLoading, fetchWeeklyActivity } = useWeeklyActivity();
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!isPreview) {
      fetchWeeklyActivity();
    }
  }, [fetchWeeklyActivity, isPreview]);

  // Always have 7 days to show bars even while loading
  const displayData = useMemo(() => {
    if (isPreview) {
      return [
        { date: "1", completed_count: 2 },
        { date: "2", completed_count: 5 },
        { date: "3", completed_count: 3 },
        { date: "4", completed_count: 8 },
        { date: "5", completed_count: 4 },
        { date: "6", completed_count: 6 },
        { date: "7", completed_count: 7 },
      ];
    }
    
    if (data.length === 7) return data;

    // Generate 7 empty days if data is not yet available
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return {
        date: d.toISOString().split("T")[0],
        completed_count: 0,
      };
    });
  }, [data, isPreview]);

  const maxCount = useMemo(() => {
    const max = Math.max(...displayData.map((d) => d.completed_count), 0);
    return max === 0 ? 1 : max;
  }, [displayData]);

  const totalCompleted = useMemo(() => {
    return displayData.reduce((acc, curr) => acc + curr.completed_count, 0);
  }, [displayData]);

  const showStats = !isLoading && (data.length > 0 || isPreview);

  return (
    <div className={styles.activityContainer}>
      <div 
        className={styles.summaryText}
        style={{ opacity: showStats ? 1 : 0, transition: "opacity 0.3s" }}
      >
        {!isPreview ? (
          `${totalCompleted} ${totalCompleted === 1 ? "tarea completada" : "tareas completadas"} esta semana`
        ) : (
          "Modo vista previa"
        )}
      </div>

      <div className={styles.chartWrapper}>
        {displayData.map((day, idx) => {
          const dateObj = isPreview ? new Date() : new Date(day.date + "T12:00:00");
          if (isPreview) dateObj.setDate(dateObj.getDate() - (6 - idx));
          
          const dayName = DAYS_ES[dateObj.getDay()];
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
