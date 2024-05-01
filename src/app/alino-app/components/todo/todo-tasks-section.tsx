"use client";

import styles from "./todo-tasks-section.module.css";
import { useEffect } from "react";
import { useLists } from "@/store/lists";
import { GetTasks } from "@/lib/todo/actions";
import { Database } from "@/lib/todosSchema";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TodoTasksSection({ setList }: { setList: ListsType }) {
  const setLists = useLists((state) => state.setLists);
  const lists = useLists((state) => state.lists);

  // useEffect(() => {
  //   const fetchTodos = async () => {
  //     const { data: tasks, error } = (await GetTasks()) as any;
  //     if (error) console.log("error", error);
  //     else setTasks(tasks);
  //   };
  //   fetchTodos();
  // }, []);

  return (
    <div className={styles.container}>
      {setList?.tasks?.map((task) => <div> {task.name} </div>)}
      {/* {setList?.tasks?.map((task) => <div></div>)} */}
    </div>
  );
}
