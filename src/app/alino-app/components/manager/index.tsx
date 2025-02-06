"use client";

import styles from "./manager.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import TodoCard from "../todo/todo-card";
import { Database } from "@/lib/schemas/todo-schema";
import { useEffect, useMemo } from "react";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Manager({
  h,
  children,
  setList,
}: {
  h?: boolean;
  children?: React.ReactNode;
  setList?: ListsType;
}) {
  const setBlurredFx = useBlurBackgroundStore((state) => state.setColor);

  useEffect(() => {
    if (setList?.color) setBlurredFx(setList.color);
  }, [setList?.color, setBlurredFx]);

  const tasks = useTodoDataStore((state) => state.tasks);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.category_id === setList?.id),
    [tasks, setList?.id]
  );

  return (
    <div className={styles.container}>
      <section className={styles.section1}>{children}</section>
      <section className={styles.section2}>
        {h && !setList ? (
          <div className={styles.tasks}>
            {tasks.map((task) => (
              <TodoCard key={task.id} task={task} />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          <div className={styles.tasks}>
            {filteredTasks.map((task) => (
              <TodoCard key={task.id} task={task} />
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p>No hay tareas...</p>
          </div>
        )}
      </section>
    </div>
  );
}
