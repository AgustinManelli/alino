"use client";

import { useEffect, useState, useRef, useCallback } from "react";

import { CounterAnimation } from "@/components/ui/counter-animation";

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

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const currentTime = tempHour || internalTime;
  const [hours, minutes] = currentTime.split(":").map(Number);

  // Refs
  const hoursRef = useRef(hours);
  const minutesRef = useRef(minutes);

  useEffect(() => {
    hoursRef.current = hours;
    minutesRef.current = minutes;
  }, [hours, minutes]);

  useEffect(() => {
    const getCurrentTime = () => {
      const now = new Date();
      return now.toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const shouldUpdate = () => {
      const currentTime = getCurrentTime();
      return !value || value === currentTime;
    };

    if (shouldUpdate()) {
      const interval = setInterval(() => {
        const newTime = getCurrentTime();

        if (!value) {
          setInternalTime(newTime);
        }

        if (value && value !== newTime) {
          clearInterval(interval);
        }
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
      const currentValue =
        type === "hour" ? hoursRef.current : minutesRef.current;
      const max = type === "hour" ? 24 : 60;

      const newValue = (currentValue + delta + max) % max;

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

        handleTimeChange(type, delta);

        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            handleTimeChange(type, delta);
          }, 100);
        }, 300);
      },
    [handleTimeChange, stopAction]
  );

  useEffect(() => stopAction, [stopAction]);

  return (
    <div className={styles.container} aria-label="Selector de hora">
      <TimeUnit
        type="hour"
        value={hours}
        createStartHandler={createStartHandler}
      />

      <div className={styles.separator}>:</div>

      <TimeUnit
        type="minute"
        value={minutes}
        createStartHandler={createStartHandler}
      />
    </div>
  );
};

const TimeUnit = ({
  type,
  value,
  createStartHandler,
}: {
  type: "hour" | "minute";
  value: number;
  createStartHandler: (
    type: "hour" | "minute",
    delta: number
  ) => (e?: any) => void;
}) => {
  const isTouchEventRef = useRef(false);

  return (
    <div className={styles.timeUnit}>
      <button
        type="button"
        className={styles.button}
        onMouseDown={(e) => {
          if (!isTouchEventRef.current) {
            createStartHandler(type, -1)(e);
          }
        }}
        onTouchStart={(e) => {
          isTouchEventRef.current = true;
          createStartHandler(type, -1)(e);
        }}
        onMouseUp={createStartHandler(type, 0)}
        onMouseLeave={createStartHandler(type, 0)}
        onTouchEnd={createStartHandler(type, 0)}
        aria-label={`Disminuir ${type === "hour" ? "horas" : "minutos"}`}
      >
        <ArrowThin
          style={{
            width: "25px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: "2",
            transform: "rotate(90deg)",
          }}
        />
      </button>

      <p className={styles.input}>
        <CounterAnimation tasksLength={value} format />
      </p>

      <button
        type="button"
        className={styles.button}
        onMouseDown={(e) => {
          if (!isTouchEventRef.current) {
            createStartHandler(type, 1)(e);
          }
        }}
        onTouchStart={(e) => {
          isTouchEventRef.current = true;
          createStartHandler(type, 1)(e);
        }}
        onMouseUp={createStartHandler(type, 0)}
        onMouseLeave={createStartHandler(type, 0)}
        onTouchEnd={createStartHandler(type, 0)}
        aria-label={`Aumentar ${type === "hour" ? "horas" : "minutos"}`}
      >
        <ArrowThin
          style={{
            width: "25px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: "2",
            transform: "rotate(-90deg)",
          }}
        />
      </button>
    </div>
  );
};
