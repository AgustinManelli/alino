import React from "react";
import { useTranslation } from "react-i18next";
import styles from "./WeeklyActivity.module.css";

export const WeeklyActivityPreview = () => {
  const { t, i18n } = useTranslation(["widgets"]);
  const isEn = (i18n.language || "es").startsWith("en");

  const previewDays = [
    { label: isEn ? "Mon" : "Lun", count: 2, height: 25 },
    { label: isEn ? "Tue" : "Mar", count: 5, height: 62 },
    { label: isEn ? "Wed" : "Mié", count: 3, height: 37 },
    { label: isEn ? "Thu" : "Jue", count: 8, height: 100 },
    { label: isEn ? "Fri" : "Vie", count: 4, height: 50 },
    { label: isEn ? "Sat" : "Sáb", count: 6, height: 75 },
    { label: isEn ? "Sun" : "Dom", count: 7, height: 87 },
  ];

  return (
    <div className={styles.activityContainer}>
      <div className={styles.summaryText}>
        {t("widgets:items.weekly-activity.summary_other", {
          count: 35,
          defaultValue: "35 tareas completadas esta semana",
        })}
      </div>
      <div className={styles.chartWrapper}>
        {previewDays.map((day) => (
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
