import React from "react";
import { useTranslation } from "react-i18next";
import { AnimatedStreakFlame } from "@/components/ui/animated-streak-flame";
import styles from "./Streak.module.css";
import { WeekHistory, WeekDayItem } from "@/app/alino-app/components/streak-section/WeekHistory";

const PREVIEW_DAYS: WeekDayItem[] = [
  { event_type: "missed" },
  { event_type: "missed" },
  { event_type: "started" },
  { event_type: "extended" },
  { event_type: "extended" },
  { event_type: "extended" },
  { event_type: "today" },
];

export const StreakPreview = () => {
  const { t } = useTranslation(["widgets"]);

  return (
    <div className={styles.streakContainer}>
      <div className={styles.mainInfo}>
        <div className={styles.flameWrapper}>
          <AnimatedStreakFlame status="active" size={60} showWarning={false} />
        </div>
        <div className={styles.countWrapper}>
          <span className={styles.currentStreak}>4</span>
          <span className={styles.streakLabel}>
            {t("widgets:items.streak.days", "DÍAS")}
          </span>
        </div>
      </div>

      <WeekHistory days={PREVIEW_DAYS} />
    </div>
  );
};
