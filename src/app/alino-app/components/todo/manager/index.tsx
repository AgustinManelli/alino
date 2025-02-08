"use client";

import styles from "./manager.module.css";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { TaskCard } from "../task-card/task-card";
import { Database } from "@/lib/schemas/todo-schema";
import { useEffect, useMemo, useState } from "react";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";
import TaskInput from "../task-input/task-input";
import { EmojiMartComponent } from "@/components/ui/emoji-mart/emoji-mart-component";
import { SquircleIcon } from "@/components/ui/icons/icons";
import { Skeleton } from "@/components/ui/skeleton";

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export default function Manager({
  setList,
  h,
  userName = "bienvenido",
}: {
  setList?: ListsType;
  h?: boolean;
  userName?: string;
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const setBlurredFx = useBlurBackgroundStore((state) => state.setColor);

  useEffect(() => {
    if (setList?.color && !h) {
      setBlurredFx(setList.color);
    } else {
      setBlurredFx("rgb(106, 195, 255)");
    }
  }, [setList?.color, setBlurredFx]);

  const tasks = useTodoDataStore((state) => state.tasks);

  const filteredTasks = useMemo(
    () => tasks.filter((task) => task.category_id === setList?.id),
    [tasks, setList?.id]
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={styles.container}>
      <section className={styles.section1}>
        {h ? (
          <section className={styles.homeContainer}>
            <div className={styles.homeSubContainer}>
              <h1 className={styles.homeTitle}>
                <span>Hola, </span>
                <span>{userName.split(" ")[0]}</span>
              </h1>
              <div className={styles.homeTimeContainer}>
                <p>
                  <span>Hoy es </span>
                  {formatDate(currentTime)} <br />
                  <span>
                    Tienes{" "}
                    {tasks.filter((task) => task.completed !== true).length}{" "}
                    tareas activas
                  </span>
                </p>
              </div>
            </div>
          </section>
        ) : (
          <div className={styles.listContainer}>
            <div className={styles.titleSection}>
              {setList ? (
                setList.icon !== null || setList.icon === "" ? (
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                    }}
                  >
                    <EmojiMartComponent
                      shortcodes={setList?.icon}
                      size="20px"
                    />
                  </div>
                ) : (
                  <SquircleIcon
                    style={{
                      width: "20px",
                      fill: `${setList?.color}`,
                      transition: "fill 0.2s ease-in-out",
                    }}
                  />
                )
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Skeleton
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "5px",
                      backgroundColor: "rgb(230,230,230)",
                    }}
                  />
                  <Skeleton
                    style={{
                      width: "100px",
                      height: "28px",
                      borderRadius: "5px",
                      backgroundColor: "rgb(230,230,230)",
                    }}
                  />
                </div>
              )}
              <h2 className={styles.listTitle}>{setList?.name}</h2>
            </div>
            <p className={styles.listSubtitle}>
              <span>
                Tienes{" "}
                {
                  tasks.filter(
                    (task) =>
                      task.completed !== true &&
                      task.category_id === setList?.id
                  ).length
                }{" "}
                tareas activas
              </span>
            </p>
          </div>
        )}
        <div className={styles.inputSection}>
          <TaskInput setList={setList} />
        </div>
      </section>
      <section className={styles.section2}>
        <div className={styles.tasksSection}>
          {h && !setList ? (
            <div className={styles.tasks}>
              {tasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            <div className={styles.tasks}>
              {filteredTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              <p>No hay tareas...</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
