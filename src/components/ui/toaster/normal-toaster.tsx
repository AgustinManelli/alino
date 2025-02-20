"use client";

import styles from "./Toaster.module.css";

interface props {
  title?: string;
  text?: string;
  icon?: React.ReactNode;
}

export function NormalToaster({ title, text, icon }: props) {
  return (
    <section className={styles.toasterContainer}>
      <section className={styles.iconSection}>{icon}</section>
      <section className={styles.textSection}>
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{text}</p>
      </section>
    </section>
  );
}
