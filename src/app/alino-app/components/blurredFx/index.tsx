"use client";

import useMobileStore from "@/store/useMobileStore";
import styles from "./blurredFx.module.css";
import { useBlurredFxStore } from "@/store/useBlurredFx";

export default function BlurredFx() {
  const blurredFx = useBlurredFxStore((state) => state.color);
  const isMobile = useMobileStore();
  return (
    <>
      {!isMobile ||
        (isMobile &&
          !window.matchMedia("(display-mode: standalone)").matches && (
            <div
              className={styles.blurred}
              style={{
                boxShadow: `${blurredFx} 20px 200px 240px`,
              }}
            ></div>
          ))}
    </>
  );
}
