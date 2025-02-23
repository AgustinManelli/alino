"use client";

import styles from "./TopBlurEffect.module.css";
import { useBlurBackgroundStore } from "@/store/useBlurBackgroundStore";

export default function TopBlurEffect() {
  const colorSelectedList = useBlurBackgroundStore((state) => state.color);

  return (
    <div
      className={styles.blurred}
      style={{
        boxShadow: `${colorSelectedList} 20px 200px 240px`,
      }}
    ></div>
  );
}
