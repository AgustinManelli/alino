"use client";

import styles from "./Summary.module.css";

export const SummaryPreview = () => {
  const percentage = Math.round((9 / 15) * 100);

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.percentageWrapper}>
        <span className={styles.percentageNumber}>{percentage}</span>
        <span className={styles.percentageSymbol}>%</span>
      </div>

      <div className={styles.statsInfo}>
        15 Tareas totales
      </div>

      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: `${percentage}%` }}
        >
          <span className={styles.completedCount}>
            9 completadas
          </span>
        </div>
      </div>
    </div>
  );
};
