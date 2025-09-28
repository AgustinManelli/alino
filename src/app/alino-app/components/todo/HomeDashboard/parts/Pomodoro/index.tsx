import { memo, useCallback, useMemo, useState } from "react";

import { stopAlarmSound, usePomodoroStore } from "@/store/usePomodoroStore";

import { ConfigIcon } from "@/components/ui/icons/icons";
import { WindowModal } from "@/components/ui/WindowModal";
import { PomodoroConfig } from "./PomodoroConfig";

import styles from "./Pomodoro.module.css";

type PomodoroMode = "work" | "shortBreak" | "longBreak";

interface ModeConfig {
  time: number;
  label: string;
  color: string;
}

const CIRCLE_CIRCUMFERENCE = 282.7;

export const Pomodoro = memo(() => {
  const [options, setOptions] = useState<boolean>(false);

  const {
    timeLeft,
    isRunning,
    mode,
    cycles,
    modes,
    toggleTimer,
    resetTimer,
    switchMode,
    formatTime,
    getProgress,
  } = usePomodoroStore();

  const handleOpenOptions = useCallback(() => {
    setOptions(true);
  }, []);

  const handleCloseOptions = useCallback(() => {
    setOptions(false);
    stopAlarmSound();
  }, []);

  const progress = getProgress();
  const formattedTime = useMemo(
    () => formatTime(timeLeft),
    [formatTime, timeLeft]
  );
  const strokeDashoffset = useMemo(
    () => CIRCLE_CIRCUMFERENCE - (CIRCLE_CIRCUMFERENCE * progress) / 100,
    [progress]
  );

  return (
    <>
      {options && (
        <WindowModal
          closeAction={handleCloseOptions}
          crossButton={true}
          title="Configuración de pomodoro"
        >
          <PomodoroConfig />
        </WindowModal>
      )}
      <div
        className={styles.container}
        style={{ "--mode-color": modes[mode].color } as React.CSSProperties}
      >
        <div className={styles.header}>
          <div className={styles.modeButtons}>
            {(Object.entries(modes) as [PomodoroMode, ModeConfig][]).map(
              ([key, modeData]) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.modeBtn} ${mode === key ? styles.active : ""}`}
                  onClick={() => switchMode(key)}
                >
                  {modeData.label}
                </button>
              )
            )}
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

              {/* Marcadores de progreso */}
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

        <div className={styles.controls}>
          <button
            type="button"
            className={`${styles.controlBtn} ${styles.primaryBtn}`}
            onClick={toggleTimer}
          >
            {isRunning ? "Pausar" : "Iniciar"}
          </button>
          <button
            type="button"
            className={`${styles.controlBtn} ${styles.secondaryBtn}`}
            onClick={resetTimer}
          >
            Reiniciar
          </button>
          <button className={styles.configButton} onClick={handleOpenOptions}>
            <ConfigIcon />
          </button>
        </div>

        <div className={styles.stats}>
          <span className={styles.cycles}>Ciclos: {cycles}</span>
        </div>
      </div>
    </>
  );
});
