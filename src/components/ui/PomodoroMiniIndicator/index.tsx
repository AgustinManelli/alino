"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import styles from "./PomodoroMiniIndicator.module.css";

interface PomodoroMiniIndicatorProps {
  onClick?: () => void;
  className?: string;
  size?: "small" | "medium" | "large";
}

export const PomodoroMiniIndicator: React.FC<PomodoroMiniIndicatorProps> = ({
  onClick,
  className = "",
  size = "medium",
}) => {
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

  const [isRendered, setIsRendered] = useState(false);
  const isInitialMount = useRef(true);

  const isCurrentlyActive = isActive();

  const GRACE_PERIOD_MS = 10000;

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    let timerId: NodeJS.Timeout;

    if (isCurrentlyActive) {
      setIsRendered(true);
    } else {
      timerId = setTimeout(() => {
        setIsRendered(false);
      }, GRACE_PERIOD_MS);
    }

    return () => {
      clearTimeout(timerId);
    };
  }, [isCurrentlyActive]);

  if (!isRendered) {
    return null;
  }

  const progress = getProgress();
  const currentMode = modes[mode];

  // Configuración de tamaños para los cálculos del SVG
  const sizeConfig = {
    small: { size: 40, stroke: 2 },
    medium: { size: 50, stroke: 3 },
    large: { size: 60, stroke: 3 },
  };

  const config = sizeConfig[size];
  const radius = (config.size - config.stroke * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

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
      // title={`${currentMode.label} - ${formatTime(timeLeft)} ${isRunning ? "(Ejecutándose)" : "(Pausado)"}`}
      style={{ "--mode-color": currentMode.color } as React.CSSProperties}
    >
      {/* Panel de controles que aparece en hover */}
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

      {/* Indicador circular principal */}
      <div className={styles.indicator}>
        <svg
          className={styles.svg}
          viewBox={`0 0 ${config.size} ${config.size}`}
        >
          {/* Círculo de fondo */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            className={styles.progressBg}
            strokeWidth={config.stroke}
          />
          {/* Círculo de progreso */}
          <circle
            cx={config.size / 2}
            cy={config.size / 2}
            r={radius}
            className={styles.progressBar}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>

        {/* Tiempo en el centro */}
        <div className={styles.timeDisplay}>{formatTime(timeLeft)}</div>
      </div>
    </div>
  );
};
