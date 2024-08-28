"use client";

import { useEffect, useState } from "react";
import styles from "./appHome.module.css";
import { useLists } from "@/store/lists";
import TodoCard from "../todo/todo-card";

export default function AppHome({ userName }: { userName: string }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const lists = useLists((state) => state.lists);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  return (
    <div className={styles.homeContainer}>
      <div className={styles.containerText}>
        <div className={styles.container}>
          <h1 className={styles.title}>
            <span>Hola,</span> <br />
            <span>{userName}</span>
          </h1>
          <div className={styles.timeContainer}>
            <p>
              <span>Hoy es </span>
              {formatDate(currentTime)}
            </p>
          </div>
        </div>
      </div>
      <div className={styles.container2}>
        <div className={styles.tasksContainer}>
          {lists?.map((list) =>
            list?.tasks?.map((task) => <TodoCard task={task} />)
          )}
        </div>
      </div>
    </div>
  );
}
