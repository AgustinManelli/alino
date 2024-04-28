"use client";

import { useListSelected } from "@/store/list-selected";
import TodoTasksSection from "./todo-tasks-section";
import TodoInput from "./todo-input";
import { SquircleIcon } from "@/lib/ui/icons";
import styles from "./todo.module.css";

export default function Todo() {
  const listSelected = useListSelected((state) => state.listSelected);

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
        <TodoTasksSection />
      </section>
    </div>
  );
}
