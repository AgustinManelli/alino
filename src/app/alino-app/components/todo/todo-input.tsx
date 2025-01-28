"use client";

import { useRef, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./todo-input.module.css";
import { Database } from "@/lib/schemas/todo-schema";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TodoInput({ setList }: { setList: ListsType }) {
  const [task, setTask] = useState<string>("");

  const formRef = useRef<HTMLDivElement>(null);

  const addTask = useTodoDataStore((state) => state.addTask);

  const handleAdd = async () => {
    setTask("");
    await addTask(setList.id, task);
  };

  return (
    <section className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.form} ref={formRef}>
          <input
            className={styles.input}
            type="text"
            placeholder="ingrese una tarea"
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleAdd();
              }
            }}
          ></input>
        </div>
      </div>
    </section>
  );
}
