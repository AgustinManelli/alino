"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

import { CounterAnimation } from "@/components/ui/counter-animation";
import { HomeIcon2 } from "@/components/ui/icons/icons";

import styles from "./HomeCard.module.css";

interface props {
  handleCloseNavbar: () => void;
}

export const HomeCard = ({ handleCloseNavbar }: props) => {
  const tasksLength = useTodoDataStore((state) => state.tasks.length);
  const animations = useUserPreferencesStore((state) => state.animations);
  const pathname = usePathname();

  const isActive = pathname === "/alino-app";

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
      aria-current={isActive ? "page" : undefined}
      prefetch={false}
    >
      <div
        className={styles.cardFx}
        style={{
          opacity: isActive ? 0.1 : 0,
          boxShadow: "rgb(106, 195, 255) 100px 50px 50px",
        }}
      ></div>

      <div className={styles.colorPickerContainer} style={{ minWidth: "16px" }}>
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
      <div className={styles.listManagerContainer}>
        <div className={styles.configsContainer}>
          <p className={`${styles.counter} ${styles.Mobile}`}>
            {animations ? (
              <CounterAnimation tasksLength={tasksLength} />
            ) : (
              tasksLength
            )}
          </p>
        </div>
      </div>
    </Link>
  );
};
