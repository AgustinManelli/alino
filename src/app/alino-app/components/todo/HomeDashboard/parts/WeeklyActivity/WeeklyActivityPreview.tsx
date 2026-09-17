import React from "react";
import styles from "./WeeklyActivity.module.css";

const PREVIEW_DAYS = [
  { label: "Lun", count: 2, height: 25 },
  { label: "Mar", count: 5, height: 62 },
  { label: "Mié", count: 3, height: 37 },
  { label: "Jue", count: 8, height: 100 },
  { label: "Vie", count: 4, height: 50 },
  { label: "Sáb", count: 6, height: 75 },
  { label: "Dom", count: 7, height: 87 },
];

export const WeeklyActivityPreview = () => {
  return (
    <div className={styles.activityContainer}>
      <div className={styles.summaryText}>
        35 tareas completadas esta semana
      </div>
      <div className={styles.chartWrapper}>
        {PREVIEW_DAYS.map((day) => (
          <div key={day.label} className={styles.barGroup}>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ height: `${day.height}%` }}
              >
                <span className={styles.barValue}>{day.count}</span>
              </div>
            </div>
            <span className={styles.dayLabel}>{day.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
