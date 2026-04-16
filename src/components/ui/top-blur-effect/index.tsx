"use client";

import { useUIStore } from "@/store/useUIStore";

import styles from "./TopBlurEffect.module.css";

export const TopBlurEffect = () => {
  const colorSelectedList = useUIStore((state) => state.color);

  return (
    <div
      className={styles.blurred}
      style={{
        boxShadow: `${colorSelectedList} 20px 200px 240px`,
      }}
    ></div>
  );
};
