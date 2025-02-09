"use client";

import { useRef, useState } from "react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-input.module.css";
import { Database } from "@/lib/schemas/todo-schema";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function TaskInput({ setList }: { setList?: ListsType }) {
  const [task, setTask] = useState<string>("");

  const formRef = useRef<HTMLDivElement>(null);

  const addTask = useTodoDataStore((state) => state.addTask);

  const handleAdd = async () => {
    setTask("");
    if (!setList) return;
    await addTask(setList.id, task);
  };

  return (
    <section className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.form} ref={formRef}>
          <input
            maxLength={200}
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
            disabled={!setList}
          ></input>
          {task.length > 0 && (
            <p
              className={styles.limitIndicator}
              style={{
                color:
                  task.length > 150
                    ? task.length > 180
                      ? task.length > 195
                        ? "#fc0303"
                        : "#fc8003"
                      : "#ffb300"
                    : "#8a8a8a",
              }}
            >
              {task.length}/200
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
