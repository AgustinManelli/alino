"use client";

import { useState } from "react";
import styles from "../navbarDesktop/listCard.module.css";
import { CounterAnimation } from "@/components";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon2 } from "@/lib/ui/icons";
import { useLists } from "@/store/lists";

interface Task {
  id: string;
  category_id: string;
  description: string;
  completed: boolean;
  index: number;
  name: string;
  created_at: string;
  updated_at: string;
}

export default function HomeCard({
  handleCloseNavbar,
}: {
  handleCloseNavbar: () => void;
}) {
  const pathname = usePathname();
  const lists = useLists((state) => state.lists);

  const [hover, setHover] = useState<boolean>(false);

  const allTasks: Task[] = lists.reduce<Task[]>((acc, list) => {
    return acc.concat(list.tasks || []);
  }, []);

  return (
    <div>
      <Link
        className={styles.container}
        onMouseEnter={() => {
          setHover(true);
        }}
        onMouseLeave={() => {
          setHover(false);
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
