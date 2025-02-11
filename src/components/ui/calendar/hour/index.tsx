"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowThin } from "../../icons/icons";
import styles from "./Hour.module.css";
import { CounterAnimation } from "../../counter-animation";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

interface TimePickerProps {
  value: string | undefined; // format "HH:mm"
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function Hour({ value, onChange, disabled = false }: TimePickerProps) {
  const [time, setTime] = useState(
    value ??
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [hours, minutes] = (value ? value : time).split(":").map(Number);
  const currentHoursRef = useRef(hours);
  const currentMinutesRef = useRef(minutes);

  const isMobile = usePlatformInfoStore((state) => state.isMobile);

  useEffect(() => {
    currentHoursRef.current = hours;
    currentMinutesRef.current = minutes;
  }, [hours, minutes]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!value) {
        // Solo actualiza el tiempo interno si no es controlado
        setTime(
          new Date().toLocaleTimeString("es-AR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })
        );
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [value]);

  const stopAction = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => stopAction();
  }, [stopAction]);

  const handleHourChange = useCallback(
    (newHour: number) => {
      const validHour = Math.max(0, Math.min(23, newHour));
      onChange(
        `${validHour.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`
      );
    },
    [minutes, onChange]
  );

  const handleMinuteChange = useCallback(
    (newMinute: number) => {
      const validMinute = Math.max(0, Math.min(59, newMinute));
      onChange(
        `${hours.toString().padStart(2, "0")}:${validMinute
          .toString()
          .padStart(2, "0")}`
      );
    },
    [hours, onChange]
  );

  type HandlerEvent =
    | React.TouchEvent<HTMLButtonElement>
    | React.MouseEvent<HTMLButtonElement>;

  const createStartHandler = useCallback(
    (type: "hour" | "minute", delta: number) => (e?: HandlerEvent) => {
      e?.preventDefault();
      stopAction();

      const updateFunction =
        type === "hour" ? handleHourChange : handleMinuteChange;
      const currentValue =
        type === "hour" ? currentHoursRef.current : currentMinutesRef.current;

      updateFunction(currentValue + delta);

      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const current =
            type === "hour"
              ? currentHoursRef.current
              : currentMinutesRef.current;
          updateFunction(current + delta);
        }, 100);
      }, 300);
    },
    [handleHourChange, handleMinuteChange, stopAction]
  );

  const isTouchEventRef = useRef(false);

  return (
    <div className={styles.container} aria-label="Time picker">
      <div className={styles.timeUnit}>
        <button
          type="button"
          className={styles.button}
          onMouseDown={(e) => {
            if (!isTouchEventRef.current) {
              createStartHandler("hour", -1)(e);
            }
          }}
          onTouchStart={(e) => {
            isTouchEventRef.current = true;
            createStartHandler("hour", -1)(e);
          }}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
          onTouchEnd={stopAction}
          disabled={disabled || hours <= 0}
          aria-label="Increase hours"
        >
          <ArrowThin
            style={{
              width: "30px",
              height: "auto",
              stroke: "#87189d",
              strokeWidth: "2",
              transform: "rotate(90deg)",
            }}
          />
        </button>

        <p className={styles.input}>
          <CounterAnimation tasksLength={hours} format />
        </p>
        <button
          type="button"
          className={styles.button}
          onMouseDown={(e) => {
            if (!isTouchEventRef.current) {
              createStartHandler("hour", 1)(e);
            }
          }}
          onTouchStart={(e) => {
            isTouchEventRef.current = true;
            createStartHandler("hour", 1)(e);
          }}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
          onTouchEnd={stopAction}
          disabled={disabled || hours >= 23}
          aria-label="Decrease hours"
        >
          <ArrowThin
            style={{
              width: "30px",
              height: "auto",
              stroke: "#87189d",
              strokeWidth: "2",
              transform: "rotate(-90deg)",
            }}
          />
        </button>
      </div>

      <div className={styles.separator}>:</div>

      <div className={styles.timeUnit}>
        <button
          type="button"
          className={styles.button}
          onMouseDown={(e) => {
            if (!isTouchEventRef.current) {
              createStartHandler("minute", -1)(e);
            }
          }}
          onTouchStart={(e) => {
            isTouchEventRef.current = true;
            createStartHandler("minute", -1)(e);
          }}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
          onTouchEnd={stopAction}
          disabled={disabled || minutes <= 0}
          aria-label="Increase minutes"
        >
          <ArrowThin
            style={{
              width: "30px",
              height: "auto",
              stroke: "#87189d",
              strokeWidth: "2",
              transform: "rotate(90deg)",
            }}
          />
        </button>

        <p className={styles.input}>
          <CounterAnimation tasksLength={minutes} format />
        </p>
        <button
          type="button"
          className={styles.button}
          onMouseDown={(e) => {
            if (!isTouchEventRef.current) {
              createStartHandler("minute", 1)(e);
            }
          }}
          onTouchStart={(e) => {
            isTouchEventRef.current = true;
            createStartHandler("minute", 1)(e);
          }}
          onMouseUp={stopAction}
          onMouseLeave={stopAction}
          onTouchEnd={stopAction}
          disabled={disabled || minutes >= 59}
          aria-label="Decrease minutes"
        >
          <ArrowThin
            style={{
              width: "30px",
              height: "auto",
              stroke: "#87189d",
              strokeWidth: "2",
              transform: "rotate(-90deg)",
            }}
          />
        </button>
      </div>
    </div>
  );
}
