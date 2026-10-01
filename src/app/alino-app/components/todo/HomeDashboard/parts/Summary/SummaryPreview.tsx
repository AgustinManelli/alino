"use client";

import { useTranslation } from "react-i18next";
import styles from "./Summary.module.css";

export const SummaryPreview = () => {
  const { t } = useTranslation(["widgets"]);
  const percentage = Math.round((9 / 15) * 100);

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.percentageWrapper}>
        <span className={styles.percentageNumber}>{percentage}</span>
        <span className={styles.percentageSymbol}>%</span>
      </div>

      <div className={styles.statsInfo}>
        {t("widgets:items.summary.totalTasks_other", {
          count: 15,
          defaultValue: "15 Tareas totales",
        })}
      </div>

      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${percentage}%` }}
        >
          <span className={styles.completedCount}>
            {t("widgets:items.summary.completed_other", {
              count: 9,
              defaultValue: "9 completadas",
            })}
          </span>
        </div>
      </div>
    </div>
  );
};
