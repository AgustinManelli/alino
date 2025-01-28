"use client";

import styles from "./manager.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import TodoCard from "../todo/todo-card";
import { Database } from "@/lib/schemas/todo-schema";
import { useEffect } from "react";
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
  const lists = useTodoDataStore((state) => state.lists);
  const setBlurredFx = useBlurBackgroundStore((state) => state.setColor);

  useEffect(() => {
    if (setList?.color !== undefined) setBlurredFx(setList?.color);
  });

  const temporalHomeListLength = lists.reduce(
    (total, list) => total + list.tasks.length,
    0
  );

  return (
    <div className={styles.container}>
      <section className={styles.section1}>{children}</section>
      <section className={styles.section2}>
        {(setList && setList.tasks.length > 0) ||
        (temporalHomeListLength > 0 && h) ? (
          <div className={styles.tasks}>
            {h && !setList
              ? lists?.map((list) =>
                  list?.tasks?.map((task) => <TodoCard task={task} />)
                )
              : setList?.tasks?.map((task) => <TodoCard task={task} />)}
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              opacity: "0.3",
            }}
          >
            <p>No hay tareas...</p>
          </div>
        )}
      </section>
    </div>
  );
}
