"use client";

import { ButtonLink } from "@/components/ui/button-link";

import styles from "./header.module.css";

export function Header() {
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
              aria-label="Prueba Alino"
              withLoader={true}
            />
          </div>
        </section>
      </div>
    </div>
  );
}
