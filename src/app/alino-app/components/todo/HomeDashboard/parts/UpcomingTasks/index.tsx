"use client";

import { useEffect } from "react";

import { TaskCard } from "./TaskCard";

import styles from "./UpcomingTasks.module.css";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Skeleton } from "@/components/ui/skeleton";
import { useFetchDashboardData } from "@/hooks/dashboard/useFetchDashboardData";

export const UpcomingTask = () => {
  const upcoming_tasks = useDashboardStore((state) => state.upcoming_tasks);
  const hasFetchedData = useDashboardStore((state) => state.hasFetchedData);
  const { fetchDashboardData } = useFetchDashboardData();

  useEffect(() => {
    if (!hasFetchedData) {
      fetchDashboardData();
    }
  }, [hasFetchedData, fetchDashboardData]);

  const init = hasFetchedData;

  return (
    <div className={styles.upcomingTasks}>
      <div className={styles.upcomingList}>
        {init
          ? upcoming_tasks.map((item, index) => (
              <div className={styles.taskCard} key={index}>
                <TaskCard task={item} />
              </div>
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
        <div style={{ width: "100%", height: "1px", minHeight: "1px" }} />
      </div>
    </div>
  );
};
