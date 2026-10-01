"use client";

import { useTranslation } from "react-i18next";
import { ConfigIcon, PlayIcon } from "@/components/ui/icons/icons";
import { Tabs, type TabOption } from "@/components/ui/Tabs/Tabs";
import styles from "./Pomodoro.module.css";

export const PomodoroPreview = () => {
  const { t } = useTranslation(["widgets"]);
  const modeColor = "#ff6b6b";
  const progress = 65;

  const tabOptions: TabOption[] = [
    { id: "work", label: t("widgets:items.pomodoro.modes.work", "Pomodoro") },
    { id: "shortBreak", label: t("widgets:items.pomodoro.modes.shortBreak", "Corto") },
    { id: "longBreak", label: t("widgets:items.pomodoro.modes.longBreak", "Largo") },
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
          <span className={styles.timeNumber}>8:44</span>
        </div>

        <div className={styles.statsInfo}>
          <span>
            {t("widgets:items.pomodoro.cycles", "Ciclos: {{count}}", { count: 2 })}
          </span>
          <div className={styles.actions}>
            <span className={styles.resetButton}>
              {t("widgets:items.pomodoro.reset", "Reiniciar")}
            </span>
            <button
              className={styles.configButton}
              title={t("widgets:items.pomodoro.settings", "Configurar")}
            >
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
