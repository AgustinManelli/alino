"use client";

import { useTranslation } from "react-i18next";
import styles from "./UpcomingTasks.module.css";
import { TaskType } from "@/lib/schemas/database.types";
import { DummyTaskCard } from "./DummyTaskCard";

export const UpcomingTasksPreview = () => {
  const { t } = useTranslation(["widgets"]);
  const MOCK_TASKS: TaskType[] = [
    {
      task_id: "mock-1",
      task_content: `<p>${t("widgets:items.upcoming-tasks.mockTask", "Reunión de equipo con diseño")}</p>`,
      completed: false,
      created_at: new Date().toISOString(),
      created_by: null,
      description: null,
      index: 0,
      list_id: "mock-list-id",
      rank: "a",
      target_date: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  return (
    <div className={styles.upcomingTasks}>
      <div className={styles.upcomingList}>
        {MOCK_TASKS.map((item) => (
          <DummyTaskCard key={item.task_id} task={item} />
        ))}
        <div style={{ width: "100%", height: "1px", minHeight: "1px" }} />
      </div>
    </div>
  );
};
