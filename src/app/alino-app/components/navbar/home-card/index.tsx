"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { Database } from "@/lib/schemas/todo-schema";

import { CounterAnimation } from "@/components/ui/counter-animation";

import { HomeIcon2 } from "@/components/ui/icons/icons";
import styles from "../list-card/ListCard.module.css";

export function HomeCard({
  handleCloseNavbar,
}: {
  handleCloseNavbar: () => void;
}) {
  const [hover, setHover] = useState<boolean>(false);

  const { lists } = useTodoDataStore();
  const { isMobile } = usePlatformInfoStore();

  const pathname = usePathname();

  const allTasks: TaskType[] = lists.reduce<TaskType[]>((acc, list) => {
    return acc.concat(list.tasks || []);
  }, []);

  return (
    <Link
      className={styles.container}
      onMouseEnter={!isMobile ? () => setHover(true) : undefined}
      onMouseLeave={() => {
        if (!isMobile) setHover(false);
      }}
      style={{
        backgroundColor:
          hover || pathname === `/alino-app`
            ? "rgb(250, 250, 250)"
            : "transparent",
        pointerEvents: "auto",
      }}
      href={`/alino-app`}
      onClick={() => {
        handleCloseNavbar();
      }}
    >
      <div
        className={styles.cardFx}
        style={{
          boxShadow:
            hover || pathname === `/alino-app`
              ? `rgb(106, 195, 255) 100px 50px 50px`
              : `initial`,
        }}
      ></div>

      <div className={styles.colorPickerContainer} style={{ minWidth: "16px" }}>
        <HomeIcon2
          style={{
            stroke: "#000",
            width: "12px",
            height: "auto",
            strokeWidth: "2.5",
          }}
        />
      </div>

      {/* IMPLEMENTAR INPUT PARA CAMBIAR DE NOMBRE CON SU RESPECTIVO BOTÓN */}
      <div className={styles.textContainer}>
        <p
          className={styles.listName}
          style={{
            color: "#1c1c1c",
          }}
        >
          home
        </p>
      </div>

      <div className={styles.listManagerContainer}>
        <div className={styles.configsContainer}>
          <p className={`${styles.counter} ${styles.Mobile}`}>
            <CounterAnimation tasksLength={allTasks.length} />
          </p>
        </div>
      </div>
    </Link>
  );
}

type TaskType = Database["public"]["Tables"]["tasks"]["Row"];
