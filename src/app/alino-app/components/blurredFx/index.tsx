"use client";

import styles from "./blurredFx.module.css";
import { useBlurredFxStore } from "@/store/useBlurredFx";

export default function BlurredFx() {
  const blurredFx = useBlurredFxStore((state) => state.color);
  return (
    <div
      className={styles.blurred}
      style={{
        boxShadow: `${blurredFx} 20px 200px 240px`,
      }}
    ></div>
  );
}
