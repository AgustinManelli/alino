"use client";

import { useState } from "react";
import { useLists } from "@/store/lists";
import styles from "./todo-input.module.css";
import PriorityPicker from "@/components/priority-picker";
import { Checkbox } from "@/components/inputs/checkbox/checkbox";

export default function TodoInput() {
  // const setAddTask = useLists((state) => state.setAddList);

  const [task, setTask] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(3);

  const handleAdd = async () => {
    // await setAddTask(task, status, priority, listSelected.id);
    setTask("");
  };

  return (
    <section className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.form}>
          <Checkbox status={status} setStatus={setStatus} />
          <input
            className={styles.input}
            type="text"
            placeholder="ingrese una tarea"
            value={task}
            onChange={(e) => {
              setTask(e.target.value);
            }}
            onKeyUp={(e) => {
              if (e.key === "enter") {
                handleAdd();
              }
            }}
          ></input>
          <PriorityPicker />
        </div>
      </div>
    </section>
  );
}
