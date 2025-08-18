"use client";

import styles from "./ConfigCard.module.css";

type props = {
  name: string;
  icon: React.ReactNode;
  action: () => void;
};

export function ConfigCard({ name, icon, action }: props) {
  return (
    <div
      className={styles.options}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      }}
    >
      {icon}
      <p>{name}</p>
    </div>
  );
}
