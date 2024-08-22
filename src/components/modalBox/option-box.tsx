"use cliente";

import { useState } from "react";
import styles from "./option-box.module.css";

interface OptionBoxProps {
  text: string;
  action: () => void;
}

export default function OptionBox({ text, action }: OptionBoxProps) {
  const [hover, setHover] = useState<boolean>(false);
  return (
    <div
      className={styles.box}
      onClick={action}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ backgroundColor: hover ? "rgb(240, 240, 240)" : "transparent" }}
    >
      {text}
    </div>
  );
}
