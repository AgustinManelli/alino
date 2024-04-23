import { TasksSchema } from "@/lib/tasks-schema";
import styles from "./todo-tasks-section.module.css";
import { useSubjectSelected } from "@/store/subject-selected";
type SubjectsType = TasksSchema["public"]["Tables"]["todo"]["Row"];

export default function TodoTasksSection({
  tasks,
}: {
  tasks: Array<SubjectsType>;
}) {
  const subjectId = useSubjectSelected((state) => state.subjectId);
  return (
    <div className={styles.container}>
      {tasks
        .filter((task) => task.subject_id === subjectId)
        .map((task) => (
          <div className={styles.card}>{task.task}</div>
        ))}
    </div>
  );
}
