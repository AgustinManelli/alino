"use client";

import React, { useRef, useState, useEffect } from "react";
import { useStreak } from "@/hooks/dashboard/useStreak";
import { ModalBox } from "@/components/ui/modal-options-box";
import { FreezeDayIcon, ProtectorIcon } from "@/components/ui/icons/icons";
import { motion } from "motion/react";
import {
  AnimatedStreakFlame,
  FlameStatus,
} from "@/components/ui/animated-streak-flame";
import styles from "./StreakSection.module.css";
import {
  getDayAbbrev,
  getDayCircleClass,
  getDayCircleContent,
  getTooltip,
} from "./streakUtils";

export const StreakSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const iconRef = useRef<HTMLDivElement>(null);
  const { streak, fetchStreak } = useStreak();

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const streakCount = streak?.current_streak || 0;
  const freeLeft = Math.max(
    0,
    (streak?.free_protectors_limit || 0) - (streak?.free_protectors_used || 0),
  );
  const purchasedCount = streak?.purchased_protectors || 0;
  const protectorsCount = freeLeft + purchasedCount;
  const isActiveToday = streak?.is_active_today || false;
  const weekDays = streak?.last_7_days || [];

  let status: FlameStatus = "off";
  if (isActiveToday) {
    status = "active";
  } else if (streakCount > 0 && streak?.last_completion_date) {
    const lastDate = new Date(streak.last_completion_date + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diffDays = Math.floor(
      (today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (diffDays === 1) status = "off";
    else if (diffDays > 1 && protectorsCount > 0) status = "frozen";
    else status = "off";
  }

  const now = new Date();
  const hoursLeft = 24 - now.getHours();
  const isEndingSoon = hoursLeft <= 4;
  const showWarning = status === "off" && isEndingSoon;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };
  const handleClose = () => setIsOpen(false);

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

  const headerSlot = (
    <div className={styles.headerSlot}>
      <span className={styles.title}>Tu racha</span>
    </div>
  );

  return (
    <div className={styles.container}>
      <div
        className={styles.triggerBtn}
        onClick={handleToggle}
        ref={iconRef}
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
      >
        <AnimatedStreakFlame
          status={status}
          size={20}
          showWarning={showWarning}
        />
        <span className={styles.streakCount}>{streakCount}</span>
      </div>

      {isOpen && (
        <ModalBox
          onClose={handleClose}
          iconRef={iconRef}
          headerSlot={headerSlot}
        >
          <div className={styles.panel}>
            <div className={styles.mainInfo}>
              <AnimatedStreakFlame
                status={status}
                size={100}
                showWarning={showWarning}
              />
              <div className={styles.countWrapper}>
                <span className={styles.currentStreak}>{streakCount}</span>
                <span className={styles.streakLabel}>DÍAS</span>
              </div>
            </div>

            <div className={styles.historySection}>
              <span className={styles.historyTitle}>Últimos 7 días</span>
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
                        className={styles.animatedBar}
                        style={{ left }}
                      />
                    );
                  })}
                </div>
                {weekDays.map((day, i) => {
                  const isProtected = day.event_type.startsWith("protected_");
                  return (
                    <div
                      key={i}
                      className={styles.dayItem}
                      title={getTooltip(day)}
                    >
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
            </div>

            <div className={styles.protectorsSection}>
              <div className={styles.protectorRow}>
                <div className={styles.protectorInfo}>
                  <ProtectorIcon className={styles.protectorIcon} />
                  <span className={styles.protectorsTitle}>
                    Protectores disponibles
                  </span>
                </div>
                <span className={styles.protectorCount}>
                  {freeLeft + purchasedCount}
                </span>
              </div>
            </div>
          </div>
        </ModalBox>
      )}
    </div>
  );
};
