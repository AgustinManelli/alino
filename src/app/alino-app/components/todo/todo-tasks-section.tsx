"use client";

import styles from "./todo-tasks-section.module.css";
import { useListSelected } from "@/store/list-selected";
import { useEffect } from "react";
import { useTodo } from "@/store/todo";
import { GetTasks } from "@/lib/todo/actions";

export default function TodoTasksSection() {
  const setTasks = useTodo((state) => state.setTasks);
  const tasks = useTodo((state) => state.tasks);
  const listSelected = useListSelected((state) => state.listSelected);

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
      {listSelected.id === "home-tasks-static-alino-app"
        ? tasks
            .filter((task) => !task.subject_id)
            .map((task) => <div className={styles.card}>{task.task}</div>)
        : tasks
            .filter((task) => task.subject_id === listSelected.id)
            .map((task) => <div className={styles.card}>{task.task}</div>)}
    </div>
  );
}
