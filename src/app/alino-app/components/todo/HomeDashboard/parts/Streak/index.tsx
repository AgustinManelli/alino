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

const generatePreviewDays = (): DayHistory[] => {
  const today = new Date();
  const days: DayHistory[] = [];
  const types: DayHistory["event_type"][] = [
    "lost",
    "missed",
    "extended",
    "extended",
    "extended",
    "extended",
    "today",
  ];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const idx = 6 - i;
    days.push({
      date: dateStr,
      event_type: types[idx],
      streak_after: idx < 5 ? 10 + idx : null,
      free_protectors_used: types[idx] === "protected_free" ? 1 : 0,
      purchased_protectors_used: 0,
    });
  }
  return days;
};

export const StreakWidget = () => {
  const { streak, isLoading, fetchStreak } = useStreak();
  const isPreview = useWidgetPreview();

  useEffect(() => {
    if (!isPreview) {
      fetchStreak();
    }
  }, [fetchStreak, isPreview]);

  const currentStreak = isPreview ? 4 : (streak?.current_streak ?? 0);
  const freeLeft = isPreview
    ? 2
    : streak
      ? streak.free_protectors_limit - streak.free_protectors_used
      : 0;
  const purchasedCount = isPreview ? 3 : (streak?.purchased_protectors ?? 0);
  const isActiveToday = isPreview ? false : (streak?.is_active_today ?? false);
  const protectorsCount = isPreview
    ? 5
    : Math.max(freeLeft, 0) + purchasedCount;
  const weekDays: DayHistory[] = isPreview
    ? generatePreviewDays()
    : (streak?.last_7_days ?? []);

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

  let status: FlameStatus = "off";
  if (isActiveToday) {
    status = "active";
  } else if (currentStreak > 0 && streak?.last_completion_date) {
    const lastDate = new Date(streak.last_completion_date + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 1) {
      status = "off";
    } else if (diffDays > 1 && protectorsCount > 0) {
      status = "frozen";
    }
  }

  const now = new Date();
  const hoursLeft = 24 - now.getHours();
  const isEndingSoon = hoursLeft <= 4;
  const showWarning = status === "off" && isEndingSoon;

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
          <span className={styles.streakLabel}>DÍAS</span>
        </div>
      </div>

      {/* Protectores disponibles */}
      {/* <div className={styles.protectorsInfo}>
        <ProtectorIcon className={styles.protectorIcon} />
        <span className={styles.protectorsCount}>
          {protectorsCount} Protector{protectorsCount !== 1 ? "es" : ""}
        </span>
        {!isPreview && streak && (
          <span className={styles.protectorsBreakdown}>
            ({Math.max(freeLeft, 0)} gratis · {purchasedCount} comprado
            {purchasedCount !== 1 ? "s" : ""})
          </span>
        )}
      </div> */}

      {/* Historial de los últimos 7 días */}
      {weekDays.length > 0 && (
        <div className={styles.weekHistory}>
          <div className={styles.barsContainer}>
            {streakGroups.map((g) => {
              const getCenterCalc = (i: number) =>
                `calc(${i} * ((100% - 12px) / 7) + ${i} * 2px + ((100% - 12px) / 14))`;
              const left = `calc(${getCenterCalc(g.start)} - 14px)`;
              const width = `calc(${getCenterCalc(g.end)} - ${getCenterCalc(g.start)} + 28px)`;
              return (
                <motion.div
                  key={g.start}
                  initial={{ width: "28px" }}
                  animate={{ width }}
                  transition={{ type: "spring", stiffness: 120, damping: 15 }}
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
