"use client";

import { useShallow } from "zustand/shallow";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";

import { SummaryPreview } from "./SummaryPreview";
import styles from "./Summary.module.css";

export const Summary = () => {
  const { tasks, completedTasks, initialFetch } = useTodoDataStore(
    useShallow((state) => ({
      tasks: state.tasks,
      completedTasks: state.completedTasks,
      initialFetch: state.initialFetch,
    })),
  );
  const isPreview = useWidgetPreview();

  if (isPreview) {
    return <SummaryPreview />;
  }

  const activeCount = tasks.length;
  const completedCount = completedTasks.length;
  const total_tasks = activeCount + completedCount;
  const completed_tasks = completedCount;
  const percentage =
    total_tasks > 0 ? Math.round((completed_tasks / total_tasks) * 100) : 0;

  return (
    <div className={styles.summaryContainer}>
      <div className={styles.percentageWrapper}>
        {initialFetch ? (
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
        {initialFetch ? (
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
          style={{ width: initialFetch ? `${percentage}%` : "0%" }}
        >
          {initialFetch && percentage > 10 && (
            <span className={styles.completedCount}>
              {completed_tasks} completadas
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

