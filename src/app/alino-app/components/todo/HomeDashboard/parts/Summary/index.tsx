"use client";
import { useEffect } from "react";
import { SummaryCircle } from "@/components/ui/SummaryCircle";

import styles from "./Summary.module.css";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useShallow } from "zustand/shallow";
import { Skeleton } from "@/components/ui/skeleton";

export const Summary = () => {
  const {
    total_tasks,
    pending_tasks,
    completed_tasks,
    hasFetchedData,
    fetchDashboardData,
  } = useDashboardStore(
    useShallow((state) => ({
      total_tasks: state.total_tasks,
      pending_tasks: state.pending_tasks,
      completed_tasks: state.completed_tasks,
      hasFetchedData: state.hasFetchedData,
      fetchDashboardData: state.fetchDashboardData,
    })),
  );

  useEffect(() => {
    if (!hasFetchedData) {
      fetchDashboardData();
    }
  }, [hasFetchedData, fetchDashboardData]);

  const init = hasFetchedData;

  return (
    <div className={styles.summaryContent}>
      <div className={styles.summaryMain}>
        <div className={styles.summaryCircleContainer}>
          <SummaryCircle
            stats={{
              completed: completed_tasks,
              pending: pending_tasks,
              total: total_tasks,
            }}
            completedFetch={init}
          />
        </div>
        <div className={styles.summaryStats}>
          <div className={styles.totalTasks}>
            {init ? (
              <span className={styles.totalNumber}>{total_tasks}</span>
            ) : (
              <Skeleton
                style={{
                  width: "30px",
                  height: "20px",
                  borderRadius: "8px",
                }}
              />
            )}
            <span className={styles.totalLabel}>tareas totales</span>
          </div>
        </div>
      </div>
      <div className={styles.summaryBreakdown}>
        <div className={styles.completedStat}>
          {init ? (
            <span className={styles.statNumber}>{completed_tasks}</span>
          ) : (
            <Skeleton
              style={{
                width: "30px",
                height: "20px",
                borderRadius: "8px",
              }}
            />
          )}
          <span className={styles.statLabel}>Completadas</span>
        </div>
        <div className={styles.pendingStat}>
          {init ? (
            <span className={styles.statNumber}>{pending_tasks}</span>
          ) : (
            <Skeleton
              style={{
                width: "30px",
                height: "20px",
                borderRadius: "8px",
              }}
            />
          )}
          <span className={styles.statLabel}>Pendientes</span>
        </div>
      </div>
    </div>
  );
};
