import { tasks } from "@/lib/todosSchema";
import styles from "./todo-card.module.css";
import { Checkbox } from "@/components";
import { useState } from "react";
import { DeleteIcon } from "@/lib/ui/icons";
import { useLists } from "@/store/lists";

export default function TodoCard({ task }: { task: tasks }) {
  const [status, setStatus] = useState<boolean>(task.completed);
  const [hover, setHover] = useState<boolean>(false);
  const deleteTask = useLists((state) => state.deleteTask);
  const handleDelete = () => {
    deleteTask(task.id, task.category_id);
  };
  const updateTaskCompleted = useLists((status) => status.updateTaskCompleted);
  const handleUpdateStatus = () => {
    setStatus(!status);
    updateTaskCompleted(task.id, task.category_id, !status);
  };
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
          status={status}
          handleUpdateStatus={handleUpdateStatus}
          id={task.id}
        />
        {task.name}
      </div>
      <button
        className={styles.deleteButton}
        style={{ opacity: hover ? "1" : "0" }}
        onClick={handleDelete}
      >
        <DeleteIcon
          style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "2" }}
        />
      </button>
    </div>
  );
}
