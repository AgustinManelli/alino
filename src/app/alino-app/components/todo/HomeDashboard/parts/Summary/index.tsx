"use client";
import { SummaryCircle } from "@/components/ui/SummaryCircle";

import styles from "./Summary.module.css";
import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { useShallow } from "zustand/shallow";
import { Skeleton } from "@/components/ui/skeleton";

export const Summary = () => {
  const { total_tasks, pending_tasks, completed_tasks } = useDashboardStore(
    useShallow((state) => ({
      total_tasks: state.total_tasks,
      pending_tasks: state.pending_tasks,
      completed_tasks: state.completed_tasks,
    }))
  );

  const [init, setInit] = useState<boolean>(false);

  const initialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized.current) {
        await useDashboardStore.getState().getStats();
        initialized.current = true;
        setInit(true);
      }
    };

    init();
  }, []);

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
