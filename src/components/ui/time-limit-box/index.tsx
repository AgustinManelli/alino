"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./TimeLimitBox.module.css";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import { Clock } from "../icons/icons";

interface props {
  target_date: string | null;
  idScrollArea?: string;
}

export function TimeLimitBox({ target_date, idScrollArea }: props) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isTooltip, setIsTooltip] = useState<boolean>(false);

  const isMobile = usePlatformInfoStore((state) => state.isMobile);

  useEffect(() => {
    if (!target_date) return;

    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Actualización cada minuto para mejor rendimiento

    return () => clearInterval(interval);
  }, [target_date]);

  const getRemainingTime = () => {
    if (!target_date) return 0;
    const targetDate = new Date(target_date);
    return targetDate.getTime() - currentTime.getTime();
  };

  const getStatusClass = () => {
    const remaining = getRemainingTime();
    if (Math.sign(remaining) === -1) {
      return styles.taskNotCompleted;
    }
    if (remaining > 0) {
      if (remaining < 2 * 60 * 60 * 1000) {
        // Menos de 2 horas
        return styles.timeTargetContainerDanger;
      }
      if (remaining < 24 * 60 * 60 * 1000) {
        // Menos de 24 horas
        return styles.timeTargetContainerWarning;
      }
    }
    return "";
  };

  const getIsCompleted = () => {
    const remaining = getRemainingTime();

    if (Math.sign(remaining) === -1) {
      return styles.notCompleted;
    } else {
      return styles.waiting;
    }
  };

  const formatDate = (dateString: string | Date): string => {
    const date = new Date(dateString);
    const now = new Date();

    // Configuración localizada
    const LOCALE = "es-ES";
    const MONTHS_SHORT = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    // Helpers reutilizables
    const isToday = (date: Date, now: Date): boolean => {
      return (
        date.getDate() === now.getDate() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    };

    const isTomorrow = (date: Date, now: Date): boolean => {
      const tomorrow = new Date(now);
      tomorrow.setDate(now.getDate() + 1);
      return (
        date.getDate() === tomorrow.getDate() &&
        date.getMonth() === tomorrow.getMonth() &&
        date.getFullYear() === tomorrow.getFullYear()
      );
    };

    const formatTime = (date: Date): string => {
      return date
        .toLocaleTimeString(LOCALE, {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
        .replace(/^24:/, "00:");
    };

    const hasTimeComponent = (date: Date): boolean => {
      return date.getHours() !== 23 && date.getMinutes() !== 59;
    };

    // Lógica principal
    if (isToday(date, now))
      return "Hoy" + (hasTimeComponent(date) ? `, ${formatTime(date)}` : "");
    if (isTomorrow(date, now))
      return "Mañana" + (hasTimeComponent(date) ? `, ${formatTime(date)}` : "");

    // Formateo de fecha base
    const day = date.getDate();
    const month = MONTHS_SHORT[date.getMonth()];
    const year = date.getFullYear();
    const showYear = date.getFullYear() !== now.getFullYear();

    return (
      `${day} ${month}${showYear ? ` ${year}` : ""}` +
      (hasTimeComponent(date) ? `, ${formatTime(date)}` : "")
    );
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsTooltip(false);
    };

    const scrollContainer = document.getElementById(`${idScrollArea}`);
    scrollContainer?.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer?.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const timeLimitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (event: MouseEvent) => {
      if (
        timeLimitRef.current &&
        timeLimitRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setIsTooltip(false);
    };

    window.addEventListener("mousedown", close);
    window.addEventListener("mouseup", close);

    return () => {
      window.removeEventListener("mousedown", close);
      window.removeEventListener("mouseup", close);
    };
  }, []);

  return (
    <>
      {target_date && (
        <div
          className={styles.container}
          style={{ width: isMobile ? 25 : "fit-content" }}
        >
          {isMobile && isTooltip && (
            <div className={`${styles.tooltip} ${getStatusClass()}`}>
              {formatDate(target_date)}
            </div>
          )}
          <div
            className={`${styles.timeTargetContainer} ${getStatusClass()}`}
            style={{
              padding: isMobile ? 0 : "0px 10px",
            }}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsTooltip((prev) => !prev);
            }}
            ref={timeLimitRef}
          >
            {!isMobile && (
              <div className={`${styles.completed} ${getIsCompleted()}`} />
            )}
            {isMobile ? (
              <Clock
                style={{
                  stroke: "#1c1c1c",
                  strokeWidth: "1.5",
                  width: "auto",
                  height: "20px",
                }}
              />
            ) : (
              <p>{formatDate(target_date)}</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
