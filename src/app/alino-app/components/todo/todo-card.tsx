"use client";
import { Database } from "@/lib/schemas/todo-schema";
type TaskType = Database["public"]["Tables"]["tasks"]["Row"];
import styles from "./todo-card.module.css";
import { Checkbox } from "@/components/ui/checkbox";
import { useState } from "react";
import { DeleteIcon } from "@/components/ui/icons/icons";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

export default function TodoCard({ task }: { task: TaskType }) {
  const [completed, setCompleted] = useState<boolean>(task.completed);
  const [hover, setHover] = useState<boolean>(false);
  const deleteTask = useTodoDataStore((state) => state.deleteTask);
  const handleDelete = async () => {
    await deleteTask(task.id);
  };
  const updateTaskCompleted = useTodoDataStore(
    (status) => status.updateTaskCompleted
  );

  const handleUpdateStatus = async () => {
    await updateTaskCompleted(task.id, !completed);
    setCompleted(!completed);
  };

  const { isMobile } = usePlatformInfoStore();

  return (
    <div
      className={styles.cardContainer}
      onMouseEnter={() => {
        setHover(true);
      }}
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <div className={styles.leftContainer}>
        <Checkbox
          status={completed}
          handleUpdateStatus={handleUpdateStatus}
          id={task.id}
        />
        <p>{task.name}</p>
      </div>
      <button
        className={styles.deleteButton}
        style={{ opacity: hover || isMobile ? "1" : "0" }}
        onClick={handleDelete}
      >
        <DeleteIcon
          style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "2" }}
        />
      </button>
    </div>
  );
}
