import React from "react";
import { AnimatedStreakFlame } from "@/components/ui/animated-streak-flame";
import styles from "./Streak.module.css";
import { WeekHistory, WeekDayItem } from "@/app/alino-app/components/streak-section/WeekHistory";

const PREVIEW_DAYS: WeekDayItem[] = [
  { day: "L", event_type: "missed" },
  { day: "M", event_type: "missed" },
  { day: "X", event_type: "started" },
  { day: "J", event_type: "extended" },
  { day: "V", event_type: "extended" },
  { day: "S", event_type: "extended" },
  { day: "D", event_type: "today" },
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

      <WeekHistory days={PREVIEW_DAYS} />
    </div>
  );
};
