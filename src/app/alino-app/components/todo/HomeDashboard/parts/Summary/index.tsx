"use client";
import { SummaryCircle } from "@/components/ui/SummaryCircle";

import { DashboardData } from "@/lib/schemas/todo-schema";

import styles from "./Summary.module.css";

export const Summary = ({
  dashboardData,
}: {
  dashboardData: DashboardData;
}) => {
  return (
    <div className={styles.summaryContent}>
      <div className={styles.summaryMain}>
        <div className={styles.summaryCircleContainer}>
          <SummaryCircle
            stats={{
              completed: dashboardData.completed_tasks,
              pending: dashboardData.pending_tasks,
              total: dashboardData.total_tasks,
            }}
          />
        </div>
        <div className={styles.summaryStats}>
          <div className={styles.totalTasks}>
            <span className={styles.totalNumber}>
              {dashboardData.total_tasks}
            </span>
            <span className={styles.totalLabel}>tareas totales</span>
          </div>
        </div>
      </div>
      <div className={styles.summaryBreakdown}>
        <div className={styles.completedStat}>
          <span className={styles.statNumber}>
            {dashboardData.completed_tasks}
          </span>
          <span className={styles.statLabel}>Completadas</span>
        </div>
        <div className={styles.pendingStat}>
          <span className={styles.statNumber}>
            {dashboardData.pending_tasks}
          </span>
          <span className={styles.statLabel}>Pendientes</span>
        </div>
      </div>
    </div>
  );
};
