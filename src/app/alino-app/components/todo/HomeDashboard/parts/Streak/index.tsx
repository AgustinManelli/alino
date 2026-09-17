"use client";
import { useEffect } from "react";
import { useStreak, DayHistory } from "@/hooks/dashboard/useStreak";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import { FreezeDayIcon } from "@/components/ui/icons/icons";
import { motion } from "motion/react";
import {
  AnimatedStreakFlame,
  FlameStatus,
} from "@/components/ui/animated-streak-flame";
import styles from "./Streak.module.css";
import {
  getDayAbbrev,
  getDayCircleClass,
  getDayCircleContent,
  getTooltip,
} from "../../../../streak-section/streakUtils";

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

  const streakGroups: { start: number; end: number }[] = [];
  let currentGroup: { start: number; end: number } | null = null;
  weekDays.forEach((day, i) => {
    const isStreak =
      day.event_type === "extended" || day.event_type === "started";
    if (isStreak) {
      if (!currentGroup) {
        currentGroup = { start: i, end: i };
      } else {
        currentGroup.end = i;
      }
    } else {
      if (currentGroup) {
        streakGroups.push(currentGroup);
        currentGroup = null;
      }
    }
  });
  if (currentGroup) {
    streakGroups.push(currentGroup);
  }

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

      {weekDays.length > 0 && (
        <div className={styles.weekHistory}>
          <div className={styles.barsContainer}>
            {streakGroups.map((g) => {
              const startPercent = ((g.start + 0.5) / 7) * 100;
              const endPercent = ((g.end + 0.5) / 7) * 100;
              const left = `calc(${startPercent}% - 14px)`;
              const width = `calc(${endPercent - startPercent}% + 28px)`;
              return (
                <motion.div
                  key={g.start}
                  initial={{ width: "28px" }}
                  animate={{ width }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                  className={styles.animatedBar}
                  style={{ left }}
                />
              );
            })}
          </div>
          {weekDays.map((day, i) => {
            const isProtected = day.event_type.startsWith("protected_");
            return (
              <div key={i} className={styles.dayItem} title={getTooltip(day)}>
                {isProtected ? (
                  <div
                    className={styles.dayCircle}
                    style={{
                      position: "relative",
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <FreezeDayIcon
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -41.77%)",
                        width: 30,
                        height: 40,
                        zIndex: 2,
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`${styles.dayCircle} ${getDayCircleClass(day.event_type, styles)}`}
                  >
                    <span className={styles.dayCircleContent}>
                      {getDayCircleContent(day.event_type)}
                    </span>
                  </div>
                )}
                <span
                  className={`${styles.dayLabel} ${day.event_type === "today" ? styles.dayLabelToday : ""}`}
                >
                  {getDayAbbrev(day.date)}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {!isPreview && isLoading && weekDays.length === 0 && (
        <div className={styles.weekHistorySkeleton}>
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className={styles.dayItem}>
              <div className={`${styles.dayCircle} ${styles.circleSkeleton}`} />
              <span className={styles.dayLabelSkeleton} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
