"use client";

import { memo, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTodoDataStore } from "@/store/useTodoDataStore";

import { CounterAnimation } from "@/components/ui/counter-animation";
import { HomeIcon2 } from "@/components/ui/icons/icons";
import styles from "./HomeCard.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

interface props {
  handleCloseNavbar: () => void;
}

export const HomeCard = memo(({ handleCloseNavbar }: props) => {
  const tasks = useTodoDataStore((state) => state.tasks);
  const { animations } = useUserPreferencesStore();
  const pathname = usePathname();

  const isActive = pathname === "/alino-app";

  const content = useMemo(() => {
    return (
      <>
        <div
          className={styles.cardFx}
          style={{
            boxShadow: isActive
              ? "rgb(106, 195, 255) 100px 50px 50px"
              : "initial",
          }}
        ></div>

        <div
          className={styles.colorPickerContainer}
          style={{ minWidth: "16px" }}
        >
          <HomeIcon2
            style={{
              stroke: "rgb(106, 195, 255)",
              width: "12px",
              height: "auto",
              strokeWidth: "2.5",
            }}
          />
        </div>

        <div className={styles.textContainer}>
          <p
            className={styles.listName}
            style={{
              color: "var(--text)",
            }}
          >
            home
          </p>
        </div>
      </>
    );
  }, [isActive]);

  const counter = useMemo(() => {
    return (
      <div className={styles.listManagerContainer}>
        <div className={styles.configsContainer}>
          <p className={`${styles.counter} ${styles.Mobile}`}>
            {animations ? (
              <CounterAnimation tasksLength={tasks.length} />
            ) : (
              tasks.length
            )}
          </p>
        </div>
      </div>
    );
  }, [tasks.length]);

  return (
    <Link
      className={`${styles.container}`}
      style={{
        backgroundColor: isActive
          ? "var(--background-over-container)"
          : "transparent",
      }}
      href="/alino-app"
      onClick={handleCloseNavbar}
    >
      {content}
      {counter}
    </Link>
  );
});
