"use client";

import styles from "./Toaster.module.css";

interface props {
  title?: string;
  text?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function NormalToaster({ title, text, icon, action }: props) {
  return (
    <section className={styles.toasterContainer}>
      {icon && <section className={styles.iconSection}>{icon}</section>}
      <section className={styles.textSection}>
        <p className={styles.title}>{title}</p>
        <p className={styles.text}>{text}</p>
      </section>
      {action && (
        <button className={styles.actionButton} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </section>
  );
}
