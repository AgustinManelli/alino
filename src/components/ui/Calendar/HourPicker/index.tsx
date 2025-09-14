"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { CounterAnimation } from "@/components/ui/CounterAnimation";
import { ArrowThin } from "@/components/ui/icons/icons";
import styles from "./HourPicker.module.css";

interface Props {
  value?: string;
  tempHour: string | undefined;
  setTempHour: (value: string | undefined) => void;
}

const getNowHHMM = () =>
  new Date().toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const HourPicker = ({ value, tempHour, setTempHour }: Props) => {
  const [internalTime, setInternalTime] = useState(value ?? getNowHHMM);
  const [editingUnit, setEditingUnit] = useState<"hour" | "minute" | null>(
    null
  );
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTime = tempHour || internalTime;
  const [hours, minutes] = currentTime.split(":").map(Number);

  const hoursRef = useRef(hours);
  const minutesRef = useRef(minutes);

  useEffect(() => {
    hoursRef.current = hours;
    minutesRef.current = minutes;
  }, [hours, minutes]);

  // Effect to sync with real-time if no value is provided
  useEffect(() => {
    if (!value) {
      const interval = setInterval(() => {
        setInternalTime(getNowHHMM());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [value]);

  const stopAction = useCallback(() => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    intervalRef.current && clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const updateTime = useCallback(
    (newHours: number, newMinutes: number) => {
      const formattedTime = `${String(newHours).padStart(2, "0")}:${String(
        newMinutes
      ).padStart(2, "0")}`;
      if (!value) setInternalTime(formattedTime);
      setTempHour(formattedTime);
    },
    [setTempHour, value]
  );

  const handleTimeChange = useCallback(
    (type: "hour" | "minute", delta: number) => {
      setIsAnimationEnabled(true);
      const current = type === "hour" ? hoursRef.current : minutesRef.current;
      const max = type === "hour" ? 24 : 60;
      const newValue = (current + delta + max) % max;

      if (type === "hour") {
        updateTime(newValue, minutesRef.current);
      } else {
        updateTime(hoursRef.current, newValue);
      }
    },
    [updateTime]
  );

  const createStartHandler = useCallback(
    (type: "hour" | "minute", delta: number) =>
      (e?: React.TouchEvent | React.MouseEvent) => {
        e?.preventDefault();
        stopAction();
        if (delta !== 0) {
          handleTimeChange(type, delta);
          timeoutRef.current = setTimeout(() => {
            intervalRef.current = setInterval(
              () => handleTimeChange(type, delta),
              100
            );
          }, 300);
        }
      },
    [handleTimeChange, stopAction]
  );

  const handleCommitChange = useCallback(
    (type: "hour" | "minute", committedValue: string) => {
      setIsAnimationEnabled(false);
      const numValue = parseInt(committedValue, 10);
      if (type === "hour") {
        updateTime(numValue, minutesRef.current);
      } else {
        updateTime(hoursRef.current, numValue);
      }
    },
    [updateTime]
  );

  const handleArrowKeyDown = useCallback(
    (type: "hour" | "minute", key: "ArrowUp" | "ArrowDown") => {
      handleTimeChange(type, key === "ArrowUp" ? 1 : -1);
    },
    [handleTimeChange]
  );

  useEffect(() => stopAction, [stopAction]);

  return (
    <div className={styles.container} aria-label="Selector de hora">
      <TimeUnit
        type="hour"
        value={hours}
        isEditing={editingUnit === "hour"}
        onInputClick={() => setEditingUnit("hour")}
        onInputBlur={() => setEditingUnit(null)}
        onCommitChange={handleCommitChange}
        createStartHandler={createStartHandler}
        onArrowKeyDown={handleArrowKeyDown}
        isAnimationEnabled={isAnimationEnabled}
      />
      <div className={styles.separator}>:</div>
      <TimeUnit
        type="minute"
        value={minutes}
        isEditing={editingUnit === "minute"}
        onInputClick={() => setEditingUnit("minute")}
        onInputBlur={() => setEditingUnit(null)}
        onCommitChange={handleCommitChange}
        createStartHandler={createStartHandler}
        onArrowKeyDown={handleArrowKeyDown}
        isAnimationEnabled={isAnimationEnabled}
      />
    </div>
  );
};

// Internal component for handling Hour/Minute units
const TimeUnit = ({
  type,
  value,
  isEditing,
  onInputClick,
  onInputBlur,
  onCommitChange,
  createStartHandler,
  onArrowKeyDown,
  isAnimationEnabled,
}: {
  type: "hour" | "minute";
  value: number;
  isEditing: boolean;
  onInputClick: () => void;
  onInputBlur: () => void;
  onCommitChange: (type: "hour" | "minute", value: string) => void;
  createStartHandler: (
    type: "hour" | "minute",
    delta: number
  ) => (e?: any) => void;
  onArrowKeyDown: (
    type: "hour" | "minute",
    key: "ArrowUp" | "ArrowDown"
  ) => void;
  isAnimationEnabled: boolean;
}) => {
  const [inputValue, setInputValue] = useState(String(value).padStart(2, "0"));
  const isTouchEventRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      setInputValue(String(value).padStart(2, "0"));
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing, value]);

  const handleCommit = () => {
    const numValue = parseInt(inputValue, 10);
    const max = type === "hour" ? 23 : 59;
    if (!isNaN(numValue) && numValue >= 0 && numValue <= max) {
      onCommitChange(type, String(numValue));
    }
    onInputBlur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      handleCommit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onInputBlur();
    } else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      onArrowKeyDown(type, e.key);
    }
  };

  return (
    <div className={styles.timeUnit}>
      <button
        type="button"
        className={styles.button}
        onMouseDown={createStartHandler(type, -1)}
        onTouchStart={() => (isTouchEventRef.current = true)}
        onMouseUp={createStartHandler(type, 0)}
        onMouseLeave={createStartHandler(type, 0)}
        onTouchEnd={createStartHandler(type, 0)}
        aria-label={`Disminuir ${type}`}
        disabled={isEditing}
      >
        <ArrowThin
          style={{
            width: "25px",
            stroke: "var(--text)",
            strokeWidth: "2",
            transform: "rotate(90deg)",
          }}
        />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          max={type === "hour" ? 23 : 59}
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;

            if (val.length <= 2 && /^\d*$/.test(val)) {
              if (val === "") {
                setInputValue(val);
                return;
              }

              const numValue = parseInt(val, 10);
              const max = type === "hour" ? 23 : 59;

              if (numValue <= max) {
                setInputValue(val);
              }
            }
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleCommit}
          className={styles.input}
          style={{
            backgroundColor: "var(--background-over-container)",
            border: "1px solid var(--border-container-color)",
            borderRadius: "10px",
          }}
        />
      ) : (
        <p
          className={styles.input}
          onClick={onInputClick}
          style={{ cursor: "pointer" }}
        >
          <CounterAnimation
            tasksLength={value}
            format
            isAnimationEnabled={isAnimationEnabled}
          />
        </p>
      )}

      <button
        type="button"
        className={styles.button}
        onMouseDown={createStartHandler(type, 1)}
        onTouchStart={() => (isTouchEventRef.current = true)}
        onMouseUp={createStartHandler(type, 0)}
        onMouseLeave={createStartHandler(type, 0)}
        onTouchEnd={createStartHandler(type, 0)}
        aria-label={`Disminuir ${type}`}
        disabled={isEditing}
      >
        <ArrowThin
          style={{
            width: "25px",
            stroke: "var(--text)",
            strokeWidth: "2",
            transform: "rotate(-90deg)",
          }}
        />
      </button>
    </div>
  );
};
