"use client";

import { useEffect, useState } from "react";
import Manager from "../manager";
import styles from "./homeManager.module.css";
import { useBlurredFxStore } from "@/store/useBlurredFx";

export default function ({ userName }: { userName: string }) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const setBlurredFx = useBlurredFxStore((state) => state.setColor);

  useEffect(() => {
    setBlurredFx("rgb(106, 195, 255)");
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Manager h={true}>
      <section className={styles.container}>
        <div className={styles.subContainer}>
          <h1 className={styles.title}>
            <span>Hola,</span> <br />
            <span>{userName}</span>
          </h1>
          <div className={styles.timeContainer}>
            <p>
              <span>Hoy es </span>
              {formatDate(currentTime)}
            </p>
          </div>
        </div>
      </section>
    </Manager>
  );
}
