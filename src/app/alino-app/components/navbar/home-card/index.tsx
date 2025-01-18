"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useLists } from "@/store/lists";
import { useMobileStore } from "@/store/useMobileStore";
import { Database } from "@/lib/todosSchema";

import { CounterAnimation } from "@/components/counter-animation";

import { HomeIcon2 } from "@/lib/ui/icons";
import styles from "../list-card/listCard.module.css";

export function HomeCard({
  handleCloseNavbar,
}: {
  handleCloseNavbar: () => void;
}) {
  const [hover, setHover] = useState<boolean>(false);

  const { lists } = useLists();
  const { isMobile } = useMobileStore();

  const pathname = usePathname();

  const allTasks: TaskType[] = lists.reduce<TaskType[]>((acc, list) => {
    return acc.concat(list.tasks || []);
  }, []);

  return (
    <div>
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
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "16px",
            minWidth: "16px",
          }}
        >
          <HomeIcon2
            style={{
              stroke: "#000",
              width: "12px",
              height: "auto",
              strokeWidth: "2.5",
            }}
          />
        </div>
        <p className={styles.listName}>home</p>
        <p className={styles.counter}>
          <CounterAnimation tasksLength={allTasks.length} />
        </p>
      </Link>
    </div>
  );
}

type TaskType = Database["public"]["Tables"]["tasks"]["Row"];
