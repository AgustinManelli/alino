"use client";

import { useEffect } from "react";
import { motion } from "motion/react";

import { useLoaderStore } from "@/store/useLoaderStore";

import { ButtonLink } from "@/components/ui/button-link";

import styles from "./header.module.css";

export function Header() {
  const { setLoading } = useLoaderStore();

  useEffect(() => {
    document.body.style.overflow = "";
    setLoading(false);
  }, [setLoading]);

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <section className={styles.section}>
          <div className={styles.text}>
            <h1>Tu espacio para estár organizado</h1>
            <p>
              Mantén tus clases, tareas y proyectos en orden y al alcance de tu
              mano.
            </p>
          </div>
          <div className={styles.ctaButton}>
            <ButtonLink
              text="Pruébalo ahora"
              background="#747474"
              hover="rgb(230, 230, 230)"
              letterColor="#fff"
              to="sign-in"
              strokeBorder={true}
              withLoader={true}
              aria-label="Prueba Alino"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
