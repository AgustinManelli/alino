"use client";
import { AddTaskToDB } from "@/lib/todo/actions";
import styles from "./todo-input.module.css";
import { useState } from "react";
import { useSubjectSelected } from "@/store/subject-selected";
import { useTodo } from "@/store/todo";

export default function TodoInput() {
  const subject_id = useSubjectSelected((state) => state.subjectId);
  const getTasks = useTodo((state) => state.getTasks);
  const [task, setTask] = useState<string>("");
  const [status, setStatus] = useState<boolean>(false);
  const [priority, setPriority] = useState<number>(3);
  const handleAdd = async () => {
    await AddTaskToDB(task, status, priority, subject_id);
    setTask("");
    getTasks();
  };
  return (
    <section
      className={styles.container}
      onSubmit={(e) => {
        e.preventDefault();
        handleAdd();
      }}
    >
      <form className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="ingrese una tarea"
          value={task}
          onChange={(e) => {
            setTask(e.target.value);
          }}
        ></input>
        <button type="submit" className={styles.button}>
          send
        </button>
      </form>
    </section>
  );
}
