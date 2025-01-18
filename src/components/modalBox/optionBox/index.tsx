"use client";

import { useState } from "react";
import styles from "./optionBox.module.css";

interface OptionBoxProps {
  children: React.ReactNode;
  text: string;
  action: () => void;
}

export default function OptionBox({ children, text, action }: OptionBoxProps) {
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
