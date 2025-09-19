"use client";
import React from "react";
import styles from "./SummaryCircle.module.css";
import { Skeleton } from "../skeleton";

interface Props {
  stats?: {
    completed: number;
    pending: number;
    total: number;
  };
  completedFetch?: boolean;
}

export const SummaryCircle = ({
  stats = { completed: 0, pending: 0, total: 0 },
  completedFetch = true,
}: Props) => {
  const completionRate = completedFetch
    ? Math.round((stats.completed / stats.total) * 100)
    : 0;

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
        {completedFetch ? (
          <span className={styles.progressPercentage}>{completionRate}%</span>
        ) : (
          <Skeleton
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "8px",
            }}
          />
        )}
      </div>
    </div>
  );
};
