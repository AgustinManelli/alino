"use client";

import { useMemo } from "react";
import { TaskCardStatic as TaskCard } from "../../../TaskCard/TaskCard";
import { AnimatePresence } from "motion/react";
import styles from "./UpcomingTasks.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";

import { UpcomingTasksPreview } from "./UpcomingTasksPreview";

export const UpcomingTask = () => {
  const tasks = useTodoDataStore((state) => state.tasks);
  const initialFetch = useTodoDataStore((state) => state.initialFetch);
  const isPreview = useWidgetPreview();

  const upcomingTasks = useMemo(() => {
    const active = tasks.filter((t) => !t.completed);
    const withDate = active.filter((t) => Boolean(t.target_date));
    const withoutDate = active.filter((t) => !t.target_date);

    withDate.sort((a, b) => {
      const timeA = new Date(a.target_date!).getTime();
      const timeB = new Date(b.target_date!).getTime();
      return timeA - timeB;
    });

    return [...withDate, ...withoutDate].slice(0, 5);
  }, [tasks]);

  if (isPreview) {
    return <UpcomingTasksPreview />;
  }

  return (
    <div className={styles.upcomingTasks}>
      <div className={styles.upcomingList}>
        <AnimatePresence mode="popLayout" initial={false}>
          {!initialFetch ? (
            Array(2)
              .fill(null)
              .map((_, index) => (
                <Skeleton
                  style={{
                    width: "100%",
                    height: "52px",
                    minHeight: "52px",
                    borderRadius: "15px",
                  }}
                  key={`skeleton-${index}`}
                />
              ))
          ) : upcomingTasks.length > 0 ? (
            upcomingTasks.map((item) => (
              <TaskCard key={item.task_id} task={item} isWidget={true} />
            ))
          ) : (
            <p
              style={{
                fontSize: "13px",
                color: "var(--text-not-available)",
                textAlign: "center",
                margin: "auto",
                padding: "20px 0",
              }}
            >
              No tienes tareas pendientes
            </p>
          )}
        </AnimatePresence>
        <div style={{ width: "100%", height: "1px", minHeight: "1px" }} />
      </div>
    </div>
  );
};

