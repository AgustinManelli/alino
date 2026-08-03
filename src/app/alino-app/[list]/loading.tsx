import { ManagerSkeleton } from "../components/todo/manager/ManagerSkeleton";
import styles from "../components/todo/todo.module.css";

export default function Loading() {
  return (
    <div className={styles.todoContainerPage}>
      <ManagerSkeleton />
    </div>
  );
}
