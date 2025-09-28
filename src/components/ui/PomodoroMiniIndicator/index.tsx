"use client";
import React, { memo, useEffect, useMemo, useState } from "react";

import { usePomodoroStore } from "@/store/usePomodoroStore";

import styles from "./PomodoroMiniIndicator.module.css";

interface Props {
  onClick?: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

const GRACE_PERIOD_MS = 10000;

export const PomodoroMiniIndicator = memo(
  ({ onClick, className = "", size = "medium" }: Props) => {
    const {
      timeLeft,
      isRunning,
      mode,
      modes,
      formatTime,
      getProgress,
      toggleTimer,
      resetTimer,
      isActive,
    } = usePomodoroStore();

    const isCurrentlyActive = isActive();

    const [isRendered, setIsRendered] = useState(false);

    useEffect(() => {
      if (isCurrentlyActive) {
        setIsRendered(true);
        return;
      }

      const timerId = setTimeout(() => {
        setIsRendered(false);
      }, GRACE_PERIOD_MS);

      return () => {
        clearTimeout(timerId);
      };
    }, [isCurrentlyActive]);

    const formattedTime = useMemo(
      () => formatTime(timeLeft),
      [formatTime, timeLeft]
    );

    if (!isRendered) {
      return null;
    }

    const progress = getProgress();
    const currentMode = modes[mode];

    const handleMainClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (onClick) {
        onClick();
      }
    };

    const handleToggleTimer = (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleTimer();
    };

    const handleResetTimer = (e: React.MouseEvent) => {
      e.stopPropagation();
      resetTimer();
    };

    return (
      <div
        className={`${styles.container} ${styles[size]} ${isRunning ? styles.running : ""} ${className}`}
        onClick={handleMainClick}
        style={{ "--mode-color": currentMode.color } as React.CSSProperties}
      >
        <div className={styles.controlsPanel}>
          <div className={styles.controlsContent}>
            <div className={styles.modeLabel}>{currentMode.label}</div>
            <div className={styles.controlButtons}>
              <button
                className={`${styles.controlBtn} ${styles.primaryBtn}`}
                onClick={handleToggleTimer}
              >
                {isRunning ? "Pausar" : "Iniciar"}
              </button>
              <button
                className={`${styles.controlBtn} ${styles.secondaryBtn}`}
                onClick={handleResetTimer}
              >
                Reiniciar
              </button>
            </div>
          </div>
        </div>

        <div className={styles.timerSection}>
          <div
            className={`${styles.timeDisplay} ${isRunning ? styles.timeRunning : ""}`}
          >
            <div className={styles.timeContainer}>{formattedTime}</div>
          </div>
          <div className={styles.progressContainer}>
            <div className={styles.progressTrack}>
              <div
                className={`${styles.progressBar} ${isRunning ? styles.animatedBar : ""}`}
                style={{
                  width: `${progress}%`,
                  backgroundColor: modes[mode].color,
                }}
              ></div>

              <div className={styles.progressMarkers}>
                {[25, 50, 75].map((marker) => (
                  <div
                    key={marker}
                    className={`${styles.progressMarker} ${
                      progress >= marker ? styles.markerActive : ""
                    }`}
                    style={{ left: `${marker}%` }}
                  >
                    <div
                      className={styles.markerDot}
                      style={{
                        backgroundColor:
                          progress >= marker
                            ? modes[mode].color
                            : "transparent",
                      }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
);
