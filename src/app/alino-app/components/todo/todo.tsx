"use client";

import TodoTasksSection from "./todo-tasks-section";
import TodoInput from "./todo-input";
import { SquircleIcon } from "@/lib/ui/icons";
import styles from "./todo.module.css";
import { useLists } from "@/store/lists";
import { Database } from "@/lib/todosSchema";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Todo({ params }: { params: { list: string } }) {
  const lists = useLists((state) => state.lists);
  const setList = lists.find(
    (elemento) => elemento.name === params.list
  ) as ListsType;

  return (
    <div className={styles.todoContainerPage}>
      <div
        className={styles.blurredReference}
        style={{
          boxShadow: `${setList?.color} 20px 200px 240px`,
        }}
      ></div>
      <section className={styles.todoContainer}>
        <SquircleIcon
          style={{
            width: "12px",
            fill: `${setList?.color}`,
            transition: "fill 0.2s ease-in-out",
          }}
        />
        <h2 className={styles.referenceText}>{params.list}</h2>
      </section>
      <section className={styles.todoManagerContainer}>
        <TodoInput />
        <TodoTasksSection setList={setList} />
      </section>
    </div>
  );
}
