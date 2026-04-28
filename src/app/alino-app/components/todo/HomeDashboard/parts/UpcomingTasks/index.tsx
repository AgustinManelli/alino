"use client";

import { useEffect } from "react";

import { TaskCardStatic as TaskCard } from "../../../TaskCard/TaskCard";
import { AnimatePresence } from "motion/react";

import styles from "./UpcomingTasks.module.css";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchDashboardData } from "@/hooks/dashboard/useFetchDashboardData";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";

import { UpcomingTasksPreview } from "./UpcomingTasksPreview";

export const UpcomingTask = () => {
  const upcoming_tasks = useDashboardStore((state) => state.upcoming_tasks);
  const hasFetchedData = useDashboardStore((state) => state.hasFetchedData);
  const { fetchDashboardData } = useFetchDashboardData();
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!hasFetchedData) {
      fetchDashboardData();
    }
  }, [hasFetchedData, fetchDashboardData]);

  if (isPreview) {
    return <UpcomingTasksPreview />;
  }

  const init = hasFetchedData;

  return (
    <div className={styles.upcomingTasks}>
      <div className={styles.upcomingList}>
        <AnimatePresence mode="popLayout" initial={false}>
          {init
            ? upcoming_tasks.map((item) => (
                <TaskCard key={item.task_id} task={item} isWidget={true} />
              ))
            : Array(2)
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
                ))}
        </AnimatePresence>
        <div style={{ width: "100%", height: "1px", minHeight: "1px" }} />
      </div>
    </div>
  );
};
