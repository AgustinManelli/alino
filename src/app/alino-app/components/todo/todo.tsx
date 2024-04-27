"use client";
import { useListSelected } from "@/store/list-selected";
import { useTodo } from "@/store/todo";
import TodoInput from "./todo-input";
import TodoTasksSection from "./todo-tasks-section";
import { GetTasks } from "@/lib/todo/actions";
import { createClient } from "@/utils/supabase/client";
import { useEffect } from "react";
import styles from "./todo.module.css";
import { SquircleIcon } from "@/lib/ui/icons";

export default function Todo() {
  const listSelected = useListSelected((state) => state.listSelected);
  const setTasks = useTodo((state) => state.setTasks);
  const tasks = useTodo((state) => state.tasks);
  const supabase = createClient();
  useEffect(() => {
    const fetchTodos = async () => {
      const { data: tasks, error } = (await GetTasks()) as any;
      if (error) console.log("error", error);
      else setTasks(tasks);
    };
    fetchTodos();
  }, [supabase]);

  return (
    <div className={styles.todoContainerPage}>
      <div
        className={styles.blurredReference}
        style={{
          boxShadow: `${listSelected.color} 20px 250px 300px`,
        }}
      ></div>
      <section className={styles.todoContainer}>
        <SquircleIcon
          style={{
            width: "12px",
            fill: `${listSelected.color}`,
            transition: "fill 0.2s ease-in-out",
          }}
        />
        <h2 className={styles.referenceText}>{listSelected.subject}</h2>
      </section>
      <section className={styles.todoManagerContainer}>
        <TodoInput />
        <TodoTasksSection tasks={tasks} />
      </section>
    </div>
  );
}
