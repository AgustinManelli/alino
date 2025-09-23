import React, { useState } from "react";
import { usePomodoroStore } from "@/store/usePomodoroStore";
import styles from "./Pomodoro.module.css";
import { ConfigIcon } from "@/components/ui/icons/icons";
import { WindowModal } from "@/components/ui/WindowModal";
import { Switch } from "@/components/ui/switch";
import { PomodoroConfig } from "./PomodoroConfig";

type PomodoroMode = "work" | "shortBreak" | "longBreak";

interface ModeConfig {
  time: number;
  label: string;
  color: string;
}

export const Pomodoro: React.FC = () => {
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

  const handleOpenOptions = () => {
    setOptions(true);
  };

  const handleCloseOptions = () => {
    setOptions(false);
  };

  const progress = getProgress();

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
          <button className={styles.configButton} onClick={handleOpenOptions}>
            <ConfigIcon />
          </button>
        </div>

        <div className={styles.timerSection}>
          <div className={styles.progressRing}>
            <svg className={styles.progressSvg} viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className={styles.progressBg} />
              <circle
                cx="50"
                cy="50"
                r="45"
                className={styles.progressBar}
                style={{
                  strokeDashoffset: `${282.7 - (282.7 * progress) / 100}`,
                }}
              />
            </svg>
            <div className={styles.timeDisplay}>{formatTime(timeLeft)}</div>
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
        </div>

        <div className={styles.stats}>
          <span className={styles.cycles}>Ciclos: {cycles}</span>
        </div>
      </div>
    </>
  );
};
