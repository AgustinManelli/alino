"use client";

import { useState } from "react";

import styles from "./ConfigCard.module.css";

type props = {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  hoverColor?: string | null;
};

export function ConfigCard({ name, icon, action, hoverColor }: props) {
  const [optionHover, setOptionHover] = useState<boolean>(false);
  return (
    <div
      className={styles.options}
      style={{
        backgroundColor: optionHover
          ? hoverColor
            ? `${hoverColor}`
            : "rgb(245,245,245)"
          : "transparent",
      }}
      onMouseEnter={() => {
        setOptionHover(true);
      }}
      onMouseLeave={() => {
        setOptionHover(false);
      }}
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
