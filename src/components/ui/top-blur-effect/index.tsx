"use client";

import { useTopBlurEffectStore } from "@/store/useTopBlurEffectStore";

import styles from "./TopBlurEffect.module.css";

export const TopBlurEffect = () => {
  const colorSelectedList = useTopBlurEffectStore((state) => state.color);

  return (
    <div
      className={styles.blurred}
      style={{
        boxShadow: `${colorSelectedList} 20px 200px 240px`,
      }}
    ></div>
  );
};
