import { TasksSchema } from "@/lib/tasks-schema";
import styles from "./todo-tasks-section.module.css";
import { useListSelected } from "@/store/list-selected";
type SubjectsType = TasksSchema["public"]["Tables"]["todo"]["Row"];

export default function TodoTasksSection({
  tasks,
}: {
  tasks: Array<SubjectsType>;
}) {
  const listSelected = useListSelected((state) => state.listSelected);
  return (
    <div className={styles.container}>
      {tasks
        .filter((task) => task.subject_id === listSelected.id)
        .map((task) => (
          <div className={styles.card}>{task.task}</div>
        ))}
    </div>
  );
}
