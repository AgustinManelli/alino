"use client";

import { useEffect, useState, useRef, useCallback, memo, useMemo } from "react";
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

export const HourPicker = memo(function HourPicker({
  value,
  tempHour,
  setTempHour,
}: Props) {
  const [internalTime, setInternalTime] = useState(value ?? getNowHHMM);
  const [editingUnit, setEditingUnit] = useState<"hour" | "minute" | null>(
    null,
  );
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTime = tempHour || internalTime;
  const [hours, minutes] = useMemo(
    () => currentTime.split(":").map(Number),
    [currentTime],
  );

  const hoursRef = useRef(hours);
  const minutesRef = useRef(minutes);

  useEffect(() => {
    hoursRef.current = hours;
    minutesRef.current = minutes;
  }, [hours, minutes]);

  useEffect(() => {
    if (!value) {
      const interval = setInterval(() => {
        setInternalTime(getNowHHMM());
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [value]);

  const stopAction = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (intervalRef.current) clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }, []);

  const updateTime = useCallback(
    (newHours: number, newMinutes: number) => {
      const formattedTime = `${String(newHours).padStart(2, "0")}:${String(
        newMinutes,
      ).padStart(2, "0")}`;
      if (!value) setInternalTime(formattedTime);
      setTempHour(formattedTime);
    },
    [setTempHour, value],
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
    [updateTime],
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
              100,
            );
          }, 300);
        }
      },
    [handleTimeChange, stopAction],
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
    [updateTime],
  );

  const handleArrowKeyDown = useCallback(
    (type: "hour" | "minute", key: "ArrowUp" | "ArrowDown") => {
      handleTimeChange(type, key === "ArrowUp" ? 1 : -1);
    },
    [handleTimeChange],
  );

  useEffect(() => stopAction, [stopAction]);

  const handleInputClickHour = useCallback(() => setEditingUnit("hour"), []);
  const handleInputClickMinute = useCallback(
    () => setEditingUnit("minute"),
    [],
  );
  const handleInputBlur = useCallback(() => setEditingUnit(null), []);

  return (
    <div className={styles.container} aria-label="Selector de hora">
      <TimeUnit
        type="hour"
        value={hours}
        isEditing={editingUnit === "hour"}
        onInputClick={handleInputClickHour}
        onInputBlur={handleInputBlur}
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
        onInputClick={handleInputClickMinute}
        onInputBlur={handleInputBlur}
        onCommitChange={handleCommitChange}
        createStartHandler={createStartHandler}
        onArrowKeyDown={handleArrowKeyDown}
        isAnimationEnabled={isAnimationEnabled}
      />
    </div>
  );
});

const arrowUpStyle = {
  width: "25px",
  stroke: "var(--text)",
  strokeWidth: "2",
  transform: "rotate(90deg)",
};

const arrowDownStyle = {
  width: "25px",
  stroke: "var(--text)",
  strokeWidth: "2",
  transform: "rotate(-90deg)",
};

const inputStyle = {
  backgroundColor: "var(--background-over-container)",
  border: "1px solid var(--border-container-color)",
  borderRadius: "10px",
};

const cursorPointer = { cursor: "pointer" };

interface TimeUnitProps {
  type: "hour" | "minute";
  value: number;
  isEditing: boolean;
  onInputClick: () => void;
  onInputBlur: () => void;
  onCommitChange: (type: "hour" | "minute", value: string) => void;
  createStartHandler: (
    type: "hour" | "minute",
    delta: number,
  ) => (e?: any) => void;
  onArrowKeyDown: (
    type: "hour" | "minute",
    key: "ArrowUp" | "ArrowDown",
  ) => void;
  isAnimationEnabled: boolean;
}

const TimeUnit = memo(function TimeUnit({
  type,
  value,
  isEditing,
  onInputClick,
  onInputBlur,
  onCommitChange,
  createStartHandler,
  onArrowKeyDown,
  isAnimationEnabled,
}: TimeUnitProps) {
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

  const handleCommit = useCallback(() => {
    const numValue = parseInt(inputValue, 10);
    const max = type === "hour" ? 23 : 59;
    if (!isNaN(numValue) && numValue >= 0 && numValue <= max) {
      onCommitChange(type, String(numValue));
    }
    onInputBlur();
  }, [inputValue, type, onCommitChange, onInputBlur]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
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
    },
    [handleCommit, onInputBlur, onArrowKeyDown, type],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
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
    },
    [type],
  );

  const onTouchStart = useCallback(() => (isTouchEventRef.current = true), []);

  const upHandler = useMemo(
    () => createStartHandler(type, -1),
    [createStartHandler, type],
  );
  const downHandler = useMemo(
    () => createStartHandler(type, 1),
    [createStartHandler, type],
  );
  const stopHandler = useMemo(
    () => createStartHandler(type, 0),
    [createStartHandler, type],
  );

  return (
    <div className={styles.timeUnit}>
      <button
        type="button"
        className={styles.button}
        onMouseDown={upHandler}
        onTouchStart={onTouchStart}
        onMouseUp={stopHandler}
        onMouseLeave={stopHandler}
        onTouchEnd={stopHandler}
        aria-label={`Disminuir ${type}`}
        disabled={isEditing}
      >
        <ArrowThin style={arrowUpStyle} />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          max={type === "hour" ? 23 : 59}
          value={inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onBlur={handleCommit}
          className={styles.input}
          style={inputStyle}
        />
      ) : (
        <p
          className={styles.input}
          onClick={onInputClick}
          style={cursorPointer}
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
        onMouseDown={downHandler}
        onTouchStart={onTouchStart}
        onMouseUp={stopHandler}
        onMouseLeave={stopHandler}
        onTouchEnd={stopHandler}
        aria-label={`Disminuir ${type}`}
        disabled={isEditing}
      >
        <ArrowThin style={arrowDownStyle} />
      </button>
    </div>
  );
});
