"use client";

import { TaskCardStatic } from "../../../task-card/task-card-static";

import styles from "./UpcomingTasks.module.css";
import { useEffect, useRef, useState } from "react";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Skeleton } from "@/components/ui/skeleton";

export const UpcomingTask = () => {
  const upcoming_tasks = useDashboardStore((state) => state.upcoming_tasks);
  const [init, setInit] = useState<boolean>(false);

  const initialized = useRef(false);

  useEffect(() => {
    const init = async () => {
      if (!initialized.current) {
        await useDashboardStore.getState().getUpcomingTasks();
        initialized.current = true;
        setInit(true);
      }
    };

    init();
  }, []);

  return (
    <div className={styles.upcomingTasks}>
      <div className={styles.upcomingList}>
        {init
          ? upcoming_tasks.map((item, index) => (
              <div className={styles.taskCard} key={index}>
                <TaskCardStatic task={item} home />
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
      </div>
    </div>
  );
};
