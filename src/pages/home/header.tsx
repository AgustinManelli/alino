"use client";

import { ButtonComp } from "@/components";
import styles from "./header.module.css";
import imgHero from "../../../public/headerAlino3DOpt.webp";
import { useLoaderStore } from "@/store/useLoaderStore";
import { useEffect } from "react";

export default function Header() {
  const setLoading = useLoaderStore((state) => state.setLoading);

  useEffect(() => {
    document.body.style.overflow = "";
    setLoading(false);
  }, [setLoading]);

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.header}>
        <section className={styles.content}>
          <div className={styles.textContainer}>
            <h1 className={styles.title}>Tu organizador en línea</h1>
            <p className={styles.subtitle}>
              Organizá tus clases, tareas o trabajos
              <span className={styles.highlight}> en un mismo lugar.</span>
            </p>
            <ButtonComp
              text="Pruébalo ya mismo"
              background="#1c1c1c"
              hover="rgb(230, 230, 230)"
              letterColor="#fff"
              to="sign-in"
              strokeBorder={true}
              withLoader={true}
              aria-label="Prueba Alino"
            />
          </div>
          <img
            src={imgHero.src}
            className={styles.image}
            alt="Vista previa de Alino"
            loading="lazy"
          />
        </section>
      </header>
    </div>
  );
}
