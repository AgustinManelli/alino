"use client";

import { useState } from "react";
import { useListSelected } from "@/store/list-selected";
import { useTodo } from "@/store/todo";
import styles from "./todo-input.module.css";
import { SquircleIcon } from "@/lib/ui/icons";
import PriorityPicker from "@/components/priority-picker";

export default function TodoInput() {
  const listSelected = useListSelected((state) => state.listSelected);
  const setAddTask = useTodo((state) => state.setAddTask);

  const [task, setTask] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(3);

  const handleAdd = async () => {
    await setAddTask(task, status, priority, listSelected.id);
    setTask("");
  };

  return (
    <section
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        handleAdd();
      }}
    >
      <div className={styles.formContainer}>
        <form className={styles.form}>
          <button
            className={styles.statusButton}
            onClick={() => {
              setStatus(!status);
            }}
          >
            <SquircleIcon
              style={{
                width: "15px",
                fill: status ? "#1c1c1c" : "transparent",
                stroke: "#1c1c1c",
                strokeWidth: "2",
                overflow: "visible",
                transition: "fill 0.2s ease",
              }}
            />
          </button>
          <input
            className={styles.input}
            type="text"
            placeholder="ingrese una tarea"
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
            }}
          ></input>
          <PriorityPicker />
        </form>
      </div>
    </section>
  );
}
