"use client";

import { ConfigIcon, PlayIcon } from "@/components/ui/icons/icons";
import { Tabs, type TabOption } from "@/components/ui/Tabs/Tabs";
import styles from "./Pomodoro.module.css";

export const PomodoroPreview = () => {
  const modeColor = "#ff6b6b";
  const progress = 65;

  const tabOptions: TabOption[] = [
    { id: "work", label: "Pomodoro" },
    { id: "shortBreak", label: "Corto" },
    { id: "longBreak", label: "Largo" },
  ];

  return (
    <div
      className={styles.container}
      style={{ "--mode-color": modeColor } as React.CSSProperties}
    >
      <header className={styles.header}>
        <Tabs
          options={tabOptions}
          activeTab="work"
          onChange={() => {}}
          className={styles.tabs}
          layoutId="pomodoro-preview-tabs"
        />
      </header>

      <div className={styles.timerSection}>
        <div className={styles.timeWrapper}>
          <span className={styles.timeNumber}>25:00</span>
        </div>

        <div className={styles.statsInfo}>
          <span>Ciclos: 2</span>
          <div className={styles.actions}>
            <span className={styles.resetButton}>Reiniciar</span>
            <button className={styles.configButton}>
              <ConfigIcon style={{ width: "16px" }} />
            </button>
          </div>
        </div>

        <div className={styles.progressRow}>
          <div className={styles.progressBarWrapper}>
            <div
              className={styles.progressBar}
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <button className={styles.playPauseBtn}>
            <PlayIcon />
          </button>
        </div>
      </div>
    </div>
  );
};
