import React from "react";
import { AnimatedStreakFlame } from "@/components/ui/animated-streak-flame";
import styles from "./Streak.module.css";

const PREVIEW_WEEK = [
  { day: "L", type: "lost" },
  { day: "M", type: "missed" },
  { day: "X", type: "extended" },
  { day: "J", type: "extended" },
  { day: "V", type: "extended" },
  { day: "S", type: "extended" },
  { day: "D", type: "today" },
];

export const StreakPreview = () => {
  return (
    <div className={styles.streakContainer}>
      <div className={styles.mainInfo}>
        <div className={styles.flameWrapper}>
          <AnimatedStreakFlame status="active" size={60} showWarning={false} />
        </div>
        <div className={styles.countWrapper}>
          <span className={styles.currentStreak}>4</span>
          <span className={styles.streakLabel}>DÍAS</span>
        </div>
      </div>

      <div className={styles.weekHistory}>
        {PREVIEW_WEEK.map((item, index) => (
          <div key={index} className={styles.dayItem}>
            <div
              className={`${styles.dayCircle} ${
                item.type === "extended"
                  ? styles.extended
                  : item.type === "today"
                    ? styles.today
                    : styles.missed
              }`}
            >
              <span className={styles.dayCircleContent}>
                {item.type === "extended" ? "✓" : item.type === "today" ? "•" : ""}
              </span>
            </div>
            <span
              className={`${styles.dayLabel} ${
                item.type === "today" ? styles.dayLabelToday : ""
              }`}
            >
              {item.day}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
