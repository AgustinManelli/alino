"use client";

import styles from "./todo-tasks-section.module.css";
import { useEffect } from "react";
import { useLists } from "@/store/lists";
import { GetTasks } from "@/lib/todo/actions";
import { Database } from "@/lib/todosSchema";
import TodoCard from "./todo-card";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TodoTasksSection({ setList }: { setList: ListsType }) {
  const setLists = useLists((state) => state.setLists);
  const lists = useLists((state) => state.lists);

  return (
    <div className={styles.container}>
      {setList?.tasks?.map((task) => <TodoCard task={task} />)}
    </div>
  );
}
