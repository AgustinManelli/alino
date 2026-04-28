"use client";

import { useEffect } from "react";
import { useShallow } from "zustand/shallow";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useFetchDashboardData } from "@/hooks/dashboard/useFetchDashboardData";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";

import { SummaryPreview } from "./SummaryPreview";
import styles from "./Summary.module.css";

export const Summary = () => {
  const { fetchDashboardData } = useFetchDashboardData();
  const { total_tasks, completed_tasks, hasFetchedData } = useDashboardStore(
    useShallow((state) => ({
      total_tasks: state.total_tasks,
      completed_tasks: state.completed_tasks,
      hasFetchedData: state.hasFetchedData,
    })),
  );
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!hasFetchedData) {
      fetchDashboardData();
    }
  }, [hasFetchedData, fetchDashboardData]);

  if (isPreview) {
    return <SummaryPreview />;
  }

  const init = hasFetchedData;
  const percentage =
    total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.percentageWrapper}>
        {init ? (
          <>
            <span className={styles.percentageNumber}>{percentage}</span>
            <span className={styles.percentageSymbol}>%</span>
          </>
        ) : (
          <Skeleton
            style={{ width: "100px", height: "52px", borderRadius: "12px" }}
          />
        )}
      </div>

      <div className={styles.statsInfo}>
        {init ? (
          `${total_tasks} ${total_tasks === 1 ? "Tarea total" : "Tareas totales"}`
        ) : (
          <Skeleton
            style={{ width: "80px", height: "12px", borderRadius: "4px" }}
          />
        )}
      </div>

      <div className={styles.progressBarWrapper}>
        <div
          className={styles.progressBar}
          style={{ width: init ? `${percentage}%` : "0%" }}
        >
          {init && percentage > 10 && (
            <span className={styles.completedCount}>
              {completed_tasks} completadas
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
