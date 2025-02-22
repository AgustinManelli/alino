"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowThin } from "../../icons/icons";
import styles from "./Hour.module.css";
import { CounterAnimation } from "../../counter-animation";

interface TimePickerProps {
  value?: string; // Formato "HH:mm"
  onChange: (time: string) => void;
  disabled?: boolean;
}

export function Hour({ value, onChange, disabled = false }: TimePickerProps) {
  const [internalTime, setInternalTime] = useState(
    value ||
      new Date().toLocaleTimeString("es-AR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      })
  );

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchEventRef = useRef(false);

  // Valor controlado o el interno
  const currentTime = value || internalTime;
  const [hours, minutes] = currentTime.split(":").map(Number);

  // Refs
  const hoursRef = useRef(hours);
  const minutesRef = useRef(minutes);

  useEffect(() => {
    hoursRef.current = hours;
    minutesRef.current = minutes;
  }, [hours, minutes]);

  // Actualización del tiempo interno si no está controlado
  // useEffect(() => {
  //   if (!value) {
  //     const interval = setInterval(() => {
  //       setInternalTime(
  //         new Date().toLocaleTimeString("es-AR", {
  //           hour: "2-digit",
  //           minute: "2-digit",
  //           hour12: false,
  //         })
  //       );
  //     }, 1000);

  //     return () => clearInterval(interval);
  //   }
  // }, [value]);

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

        // Actualizar solo si estamos en modo no controlado o el value coincide
        if (!value) {
          setInternalTime(newTime);
        }

        // Si tenemos value pero ya no coincide, detener el intervalo
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
      onChange(formattedTime);
    },
    [onChange, value]
  );

  const handleTimeChange = useCallback(
    (type: "hour" | "minute", delta: number) => {
      if (disabled) return;

      const currentValue =
        type === "hour" ? hoursRef.current : minutesRef.current;
      const max = type === "hour" ? 24 : 60;

      // Cálculo seguro con módulo
      const newValue = (currentValue + delta + max) % max;

      if (type === "hour") {
        updateTime(newValue, minutesRef.current);
      } else {
        updateTime(hoursRef.current, newValue);
      }
    },
    [disabled, updateTime]
  );

  const createStartHandler = useCallback(
    (type: "hour" | "minute", delta: number) =>
      (e?: React.TouchEvent | React.MouseEvent) => {
        e?.preventDefault();
        stopAction();

        // Primer cambio inmediato
        handleTimeChange(type, delta);

        // Configurar repetición después de 300ms
        timeoutRef.current = setTimeout(() => {
          intervalRef.current = setInterval(() => {
            handleTimeChange(type, delta);
          }, 100);
        }, 300);
      },
    [handleTimeChange, stopAction]
  );

  // Limpieza al desmontar
  useEffect(() => stopAction, [stopAction]);

  return (
    <div className={styles.container} aria-label="Selector de hora">
      <TimeUnit
        type="hour"
        value={hours}
        disabled={disabled}
        createStartHandler={createStartHandler}
      />

      <div className={styles.separator}>:</div>

      <TimeUnit
        type="minute"
        value={minutes}
        disabled={disabled}
        createStartHandler={createStartHandler}
      />
    </div>
  );
}

// Componente auxiliar para unidades de tiempo
const TimeUnit = ({
  type,
  value,
  disabled,
  createStartHandler,
}: {
  type: "hour" | "minute";
  value: number;
  disabled: boolean;
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
        disabled={disabled}
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
            stroke: "#87189d",
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
        disabled={disabled}
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
            stroke: "#87189d",
            strokeWidth: "2",
            transform: "rotate(-90deg)",
          }}
        />
      </button>
    </div>
  );
};
