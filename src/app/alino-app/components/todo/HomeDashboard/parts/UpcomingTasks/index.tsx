"use client";

import { TaskCardStatic } from "../../../task-card/task-card-static";
import { TaskType } from "@/lib/schemas/todo-schema";

import styles from "./UpcomingTasks.module.css";

export const UpcomingTask = ({ tasks }: { tasks: TaskType[] }) => {
  return (
    <div className={styles.upcomingTasks}>
      <div className={styles.upcomingList}>
        {tasks.map((item, index) => (
          <div className={styles.taskCard} key={index}>
            <TaskCardStatic task={item} home />
          </div>
        ))}
      </div>
    </div>
  );
};
