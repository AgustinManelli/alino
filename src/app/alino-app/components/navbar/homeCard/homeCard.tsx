"use client";

import { useState } from "react";
import styles from "../listCard/listCard.module.css";
import { CounterAnimation } from "@/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon2 } from "@/lib/ui/icons";
import { useLists } from "@/store/lists";
import useMobileStore from "@/store/useMobileStore";

import { Database } from "@/lib/todosSchema";
type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

export default function HomeCard({
  handleCloseNavbar,
}: {
  handleCloseNavbar: () => void;
}) {
  const pathname = usePathname();
  const lists = useLists((state) => state.lists);

  const [hover, setHover] = useState<boolean>(false);

  const isMobile = useMobileStore((state) => state.isMobile);

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
