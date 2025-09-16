"use client";
import React from "react";
import styles from "./SummaryCircle.module.css";

interface Props {
  stats?: {
    completed: number;
    pending: number;
    total: number;
  };
}

export const SummaryCircle = ({
  stats = { completed: 24, pending: 12, total: 36 },
}: Props) => {
  const completionRate = Math.round((stats.completed / stats.total) * 100);

  return (
    <div className={styles.summaryCircleContainer}>
      <svg className={styles.progressSvg} viewBox="0 0 64 64">
        <circle cx="32" cy="32" r="28" className={styles.progressBackground} />
        <circle
          cx="32"
          cy="32"
          r="28"
          className={styles.progressBar}
          strokeDasharray={`${completionRate * 1.76} 176`}
        />
      </svg>
      <div className={styles.progressText}>
        <span className={styles.progressPercentage}>{completionRate}%</span>
      </div>
    </div>
  );
};
