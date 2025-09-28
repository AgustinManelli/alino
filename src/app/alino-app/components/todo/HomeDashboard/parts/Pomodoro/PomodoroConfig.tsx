import React, { useState } from "react";
import {
  usePomodoroStore,
  playAlarmSound,
  stopAlarmSound,
} from "@/store/usePomodoroStore";
import { Switch } from "@/components/ui/switch";
import styles from "./PomodoroConfig.module.css";
import { NumberInput } from "@/components/ui/NumberInput";
import { PlayIcon, StopIcon } from "@/components/ui/icons/icons";

const soundOptions = [
  { value: "bell-notification-1", label: "Campana 1" },
  { value: "bell-notification-2", label: "Campana 2" },
  { value: "timer-terminer", label: "Temporizador" },
  { value: "relax-notification", label: "Relax" },
  { value: "marimba-notification", label: "Marimba" },
  { value: "system-notification", label: "Sistema" },
];

export const PomodoroConfig = () => {
  const { settings, cycles, updateSettings, updateCycles, resetSettings } =
    usePomodoroStore();
  const [showSoundDropdown, setShowSoundDropdown] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);

  const handleVolumeChange = (value: string) => {
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));

    setTempSettings((prev) => ({
      ...prev,
      volume: clampedValue,
    }));

    updateSettings({ volume: clampedValue });
  };

  const handleSoundChange = (soundValue: string) => {
    setTempSettings((prev) => ({
      ...prev,
      alarmSound: soundValue,
    }));
    updateSettings({ alarmSound: soundValue });
    stopAlarmSound();
    setIsAlarmPlaying(false);
    setShowSoundDropdown(false);
  };

  const handleToggleAutoStartBreaks = () => {
    const newValue = !tempSettings.autoStartBreaks;
    setTempSettings((prev) => ({ ...prev, autoStartBreaks: newValue }));
    updateSettings({ autoStartBreaks: newValue });
  };

  const handleToggleAutoStartPomodoros = () => {
    const newValue = !tempSettings.autoStartPomodoros;
    setTempSettings((prev) => ({ ...prev, autoStartPomodoros: newValue }));
    updateSettings({ autoStartPomodoros: newValue });
  };

  const handleToggleNotifications = () => {
    const newValue = !tempSettings.notifications;
    setTempSettings((prev) => ({ ...prev, notifications: newValue }));
    updateSettings({ notifications: newValue });
    if (
      newValue &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  };

  const handleResetToDefaults = () => {
    resetSettings();
    setTempSettings(usePomodoroStore.getState().settings);
  };

  const selectedSound = soundOptions.find(
    (sound) => sound.value === tempSettings.alarmSound
  );

  const handleSettingsChange = (
    field: keyof typeof tempSettings,
    value: number | boolean | string
  ) => {
    setTempSettings((prev) => ({ ...prev, [field]: value }));
    updateSettings({ [field]: value });
  };

  const handleToggleAlarm = () => {
    if (isAlarmPlaying) {
      stopAlarmSound();
      setIsAlarmPlaying(false);
    } else {
      playAlarmSound(tempSettings.alarmSound, 0);
      setIsAlarmPlaying(true);
    }
  };

  const handleCyclesChange = (newCycle: number) => {
    updateCycles(newCycle);
  };

  return (
    <section className={styles.pomoBody}>
      <section className={styles.timerConfig}>
        <div className={styles.timeConfig}>
          <p className={styles.titleSectionConfig}>Datos</p>
          <div className={styles.configPomodoroTime}>
            <div className={styles.timeLabel}>
              <span>Ciclos realizados</span>
              <NumberInput
                value={cycles}
                onChange={(newValue) => handleCyclesChange(newValue)}
                min={0}
                max={120}
              />
            </div>
          </div>
        </div>
      </section>
      <section className={styles.timerConfig}>
        <div className={styles.timeConfig}>
          <p className={styles.titleSectionConfig}>Tiempos (minutos)</p>

          <div className={styles.configPomodoroTime}>
            <div className={styles.timeLabel}>
              <span>Pomodoro</span>
              <NumberInput
                value={tempSettings.workTime}
                onChange={(newValue) =>
                  handleSettingsChange("workTime", newValue)
                }
                min={1}
                max={120}
              />
            </div>
          </div>

          <div className={styles.configShortBreakTime}>
            <div className={styles.timeLabel}>
              <span>Descanso corto</span>
              <NumberInput
                value={tempSettings.shortBreakTime}
                onChange={(newValue) =>
                  handleSettingsChange("shortBreakTime", newValue)
                }
                min={1}
                max={120}
              />
            </div>
          </div>

          <div className={styles.configLongBreakTime}>
            <div className={styles.timeLabel}>
              <span>Descanso largo</span>
              <NumberInput
                value={tempSettings.longBreakTime}
                onChange={(newValue) =>
                  handleSettingsChange("longBreakTime", newValue)
                }
                min={1}
                max={120}
              />
            </div>
          </div>
        </div>

        <div className={styles.separator}></div>

        <div className={styles.autoStartBreaks}>
          <div className={styles.switchContainer}>
            <p className={styles.titleSectionConfig}>Auto inicio de breaks</p>
            <Switch
              value={tempSettings.autoStartBreaks}
              action={handleToggleAutoStartBreaks}
              width={40}
            />
          </div>
        </div>

        <div className={styles.autoStartPomodoros}>
          <div className={styles.switchContainer}>
            <p className={styles.titleSectionConfig}>Auto inicio de pomodoro</p>
            <Switch
              value={tempSettings.autoStartPomodoros}
              action={handleToggleAutoStartPomodoros}
              width={40}
            />
          </div>
        </div>

        <div className={styles.LongBreakInterval}>
          <p className={styles.titleSectionConfig}>
            Intervalo de ciclos para long breaks
          </p>
          <div className={styles.longBreaksIntervalConfig}>
            <div className={styles.intervalLabel}>
              <span>Cada</span>
              <NumberInput
                value={tempSettings.longBreakInterval}
                onChange={(newValue) =>
                  handleSettingsChange("longBreakInterval", newValue)
                }
                min={2}
                max={10}
              />
              <span>ciclos</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.separator}></div>

      <section className={styles.soundsConfig}>
        <p className={styles.titleSectionConfig}>Configuración de sonido</p>

        <div className={styles.alarmSoundConfig}>
          <div className={styles.soundLabel}>
            <span className={styles.soundLabelTitle}>Sonido de alarma</span>
            <div className={styles.soundSelectorContainer}>
              <div className={styles.soundDropdownContainer}>
                <button
                  type="button"
                  className={styles.soundDropdownButton}
                  onClick={() => setShowSoundDropdown(!showSoundDropdown)}
                >
                  <span>{selectedSound?.label}</span>
                  <span className={styles.dropdownArrow}>▼</span>
                </button>

                {showSoundDropdown && (
                  <div className={styles.soundDropdownMenu}>
                    {soundOptions.map((sound) => (
                      <button
                        key={sound.value}
                        type="button"
                        className={`${styles.soundOption} ${
                          sound.value === tempSettings.alarmSound
                            ? styles.selectedOption
                            : ""
                        }`}
                        onClick={() => handleSoundChange(sound.value)}
                      >
                        {sound.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className={styles.testSoundButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleAlarm();
                }}
              >
                {!isAlarmPlaying ? <PlayIcon /> : <StopIcon />}
              </button>
            </div>
          </div>
        </div>

        <div className={styles.volumeConfig}>
          <label className={styles.volumeLabel}>
            <span>Volumen ({tempSettings.volume}%)</span>
            <div className={styles.volumeSliderContainer}>
              <input
                type="range"
                min="0"
                max="100"
                value={tempSettings.volume}
                onChange={(e) => handleVolumeChange(e.target.value)}
                className={styles.volumeSlider}
              />
            </div>
          </label>
        </div>

        <div>
          <div className={styles.volumeLabel}>
            <span>Repeticiones</span>
            <NumberInput
              value={tempSettings.alarmRep}
              onChange={(newValue) =>
                handleSettingsChange("alarmRep", newValue)
              }
              min={1}
              max={10}
            />
          </div>
        </div>
      </section>

      <div className={styles.separator}></div>

      <section className={styles.notificationsConfig}>
        <div className={styles.switchContainer}>
          <p className={styles.titleSectionConfig}>
            Notificaciones del navegador
          </p>
          <Switch
            value={tempSettings.notifications}
            action={handleToggleNotifications}
            width={40}
          />
        </div>
      </section>

      <div className={styles.separator}></div>

      <section className={styles.configActions}>
        <button
          type="button"
          onClick={handleResetToDefaults}
          className={styles.resetButton}
        >
          Restaurar valores por defecto
        </button>
      </section>
    </section>
  );
};
