"use client";
import { useEffect } from "react";
import { useStreak, DayHistory } from "@/hooks/dashboard/useStreak";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import {
  AnimatedStreakFlame,
  FlameStatus,
} from "@/components/ui/animated-streak-flame";
import styles from "./Streak.module.css";
import { WeekHistory } from "@/app/alino-app/components/streak-section/WeekHistory";

import { StreakPreview } from "./StreakPreview";

export const StreakWidget = () => {
  const { streak, isLoading, fetchStreak } = useStreak();
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!isPreview) {
      fetchStreak();
    }
  }, [fetchStreak, isPreview]);

  if (isPreview) {
    return <StreakPreview />;
  }

  const currentStreak = streak?.current_streak ?? 0;
  const freeLeft = streak
    ? streak.free_protectors_limit - streak.free_protectors_used
    : 0;
  const purchasedCount = streak?.purchased_protectors ?? 0;
  const isActiveToday = streak?.is_active_today ?? false;
  const protectorsCount = Math.max(freeLeft, 0) + purchasedCount;
  const weekDays: DayHistory[] = streak?.last_7_days ?? [];



  const yesterday = weekDays.length >= 2 ? weekDays[weekDays.length - 2] : null;
  const wasYesterdayProtected = Boolean(
    yesterday?.event_type.startsWith("protected_"),
  );

  let status: FlameStatus = "off";
  if (isActiveToday) {
    status = "active";
  } else if (currentStreak > 0 && streak?.last_completion_date) {
    const lastDate = new Date(streak.last_completion_date + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.round(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (wasYesterdayProtected || (diffDays > 1 && protectorsCount > 0)) {
      status = "frozen";
    } else {
      status = "off";
    }
  }

  const now = new Date();
  const endOfDay = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  const hoursLeft = Math.max(
    0,
    (endOfDay.getTime() - now.getTime()) / (1000 * 60 * 60),
  );
  const isEndingSoon = hoursLeft <= 4;
  const showWarning = currentStreak > 0 && status === "off" && isEndingSoon;

  return (
    <div className={styles.streakContainer}>
      <div className={styles.mainInfo}>
        <div className={styles.flameWrapper}>
          <AnimatedStreakFlame
            status={status}
            size={60}
            showWarning={showWarning}
          />
        </div>
        <div className={styles.countWrapper}>
          <span className={styles.currentStreak}>{currentStreak}</span>
          <span className={styles.streakLabel}>
            {currentStreak === 1 ? "DÍA" : "DÍAS"}
          </span>
        </div>
      </div>

      <WeekHistory days={weekDays} isLoading={!isPreview && isLoading} />
    </div>
  );
};
