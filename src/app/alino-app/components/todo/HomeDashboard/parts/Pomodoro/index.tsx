"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { stopAlarmSound, usePomodoroStore } from "@/store/usePomodoroStore";
import { ConfigIcon, PlayIcon, StopIcon } from "@/components/ui/icons/icons";
import { WindowModal } from "@/components/ui/WindowModal";
import { PomodoroConfig } from "./PomodoroConfig";
import { Tabs, type TabOption } from "@/components/ui/Tabs/Tabs";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import { PomodoroPreview } from "./PomodoroPreview";

import styles from "./Pomodoro.module.css";

export const Pomodoro = memo(() => {
  const [options, setOptions] = useState<boolean>(false);
  const isPreview = useWidgetPreview();

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
    [formatTime, timeLeft],
  );

  const tabOptions: TabOption[] = useMemo(
    () => [
      { id: "work", label: "Pomodoro" },
      { id: "shortBreak", label: "Corto" },
      { id: "longBreak", label: "Largo" },
    ],
    [],
  );

  if (isPreview) {
    return <PomodoroPreview />;
  }

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
        <header className={styles.header}>
          <Tabs
            options={tabOptions}
            activeTab={mode}
            onChange={(id) => switchMode(id as any)}
            className={styles.tabs}
            layoutId="pomodoro-tabs"
          />
        </header>

        <div className={styles.timerSection}>
          <div className={styles.timeWrapper}>
            <span className={styles.timeNumber}>{formattedTime}</span>
          </div>

          <div className={styles.statsInfo}>
            <span>Ciclos: {cycles}</span>
            <div className={styles.actions}>
              <span className={styles.resetButton} onClick={resetTimer}>
                Reiniciar
              </span>
              <button
                className={styles.configButton}
                onClick={handleOpenOptions}
                title="Configurar"
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
            <button
              className={styles.playPauseBtn}
              onClick={toggleTimer}
              aria-label={isRunning ? "Pausar" : "Iniciar"}
            >
              {isRunning ? <StopIcon /> : <PlayIcon />}
            </button>
          </div>
        </div>
      </div>
    </>
  );
});
