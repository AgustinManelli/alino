"use client";

import { useEffect } from "react";
import { useStreak } from "@/hooks/dashboard/useStreak";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import { ProtectorIcon } from "@/components/ui/icons/icons";
import {
  AnimatedStreakFlame,
  FlameStatus,
} from "@/components/ui/animated-streak-flame";
import styles from "./Streak.module.css";

export const StreakWidget = () => {
  const { streak, isLoading, fetchStreak } = useStreak();
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!isPreview) {
      fetchStreak();
    }
  }, [fetchStreak, isPreview]);

  const currentStreak = isPreview ? 12 : streak?.current_streak || 0;
  // const maxStreak = isPreview ? 15 : streak?.max_streak || 0;
  const freeLeft = isPreview
    ? 2
    : streak
      ? streak.free_protectors_limit - streak.free_protectors_used
      : 0;
  const purchasedCount = isPreview ? 3 : streak?.purchased_protectors || 0;
  const isActiveToday = isPreview ? true : streak?.is_active_today || false;
  const protectorsCount = isPreview ? 5 : freeLeft + purchasedCount;

  let status: FlameStatus = "off";

  if (isActiveToday) {
    status = "active";
  } else if (currentStreak > 0 && streak?.last_completion_date) {
    const lastDate = new Date(streak.last_completion_date + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);

    const diffTime = today.getTime() - lastDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      status = "off";
    } else if (diffDays > 1 && protectorsCount > 0) {
      status = "frozen";
    } else {
      status = "off";
    }
  } else {
    status = "off";
  }

  return (
    <div className={styles.streakContainer}>
      <div className={styles.mainInfo}>
        <div className={styles.flameWrapper}>
          <AnimatedStreakFlame status={status} size={60} />
        </div>
        <div className={styles.countWrapper}>
          <span className={styles.currentStreak}>{currentStreak}</span>
          <span className={styles.streakLabel}>DÍAS</span>
        </div>
      </div>

      <div className={styles.protectorsInfo}>
        <ProtectorIcon className={styles.protectorIcon} />
        <span className={styles.protectorsCount}>
          {freeLeft + purchasedCount} Protectores
        </span>
      </div>

      {/* {!isPreview && maxStreak > 0 && (
        <div className={styles.maxStreakInfo}>Racha máxima: {maxStreak}</div>
      )} */}
    </div>
  );
};
