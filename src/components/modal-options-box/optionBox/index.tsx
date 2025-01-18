"use client";

import { useState } from "react";

import styles from "./OptionBox.module.css";

interface props {
  children: React.ReactNode;
  text: string;
  action: () => void;
}

export function OptionBox({ children, text, action }: props) {
  const [hover, setHover] = useState<boolean>(false);
  return (
    <div
      className={styles.box}
      onClick={action}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: hover ? "rgb(240, 240, 240)" : "transparent" }}
    >
      {children}
      {text}
    </div>
  );
}
