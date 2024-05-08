import { tasks } from "@/lib/todosSchema";
import styles from "./todo-card.module.css";
import { Checkbox } from "@/components/inputs/checkbox/checkbox";
import { useState } from "react";

export default function TodoCard({ task }: { task: tasks }) {
  const [status, setStatus] = useState<boolean>(task.completed);
  return (
    <div className={styles.cardContainer}>
      <Checkbox status={status} setStatus={setStatus} id={task.id} />
      {task.name}
    </div>
  );
}
