"use client";

import styles from "./blurredFx.module.css";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";

export default function BlurredFx() {
  const blurredFx = useBlurBackgroundStore((state) => state.color);
  return (
    <div
      className={styles.blurred}
      style={{
        boxShadow: `${blurredFx} 20px 200px 240px`,
      }}
    ></div>
  );
}
