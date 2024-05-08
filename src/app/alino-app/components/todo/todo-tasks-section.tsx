"use client";

import styles from "./todo-tasks-section.module.css";
import { Database } from "@/lib/todosSchema";
import TodoCard from "./todo-card";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TodoTasksSection({ setList }: { setList: ListsType }) {
  return (
    <div className={styles.container}>
      {setList?.tasks?.map((task) => <TodoCard task={task} />)}
    </div>
  );
}
