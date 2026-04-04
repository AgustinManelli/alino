"use client";

import { memo } from "react";

import styles from "./ConfigCard.module.css";

interface Props {
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

export const ConfigCard = memo(function ConfigCard({
  name,
  icon,
  action,
}: Props) {
  return (
    <button
      type="button"
      className={styles.options}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        action();
      }}
    >
      {icon}
      <p>{name}</p>
    </button>
  );
});
