"use client";

import { createPortal } from "react-dom";
import { useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { Cross } from "@/lib/ui/icons";
import styles from "./window-component.module.css";

interface props {
  children?: React.ReactNode;
  windowName: string;
  crossAction: () => void;
}

export function WindowComponent({ children, windowName, crossAction }: props) {
  const windowRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    windowRef,
    () => {
      crossAction();
    },
    windowRef
  );

  return createPortal(
    <motion.div
      key={"window-component-container"}
      initial={{
        backgroundColor: "rgba(0, 0, 0, 0)",
      }}
      animate={{
        backgroundColor: "rgba(0, 0, 0, 0.3)",
      }}
      exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      transition={{
        duration: 0.3,
        ease: "easeInOut",
      }}
      className={styles.container}
    >
      <motion.div
        className={styles.window}
        ref={windowRef}
        key={"window-component-modal"}
        initial={{
          scale: 0.8,
          opacity: 0,
          y: -50,
        }}
        animate={{
          scale: 1,
          opacity: 1,
          y: 0,
        }}
        exit={{
          scale: 0.8,
          opacity: 0,
        }}
        transition={{
          duration: 0.4,
          ease: [0.23, 1, 0.32, 1],
          opacity: { duration: 0.2 },
        }}
      >
        <section className={styles.header}>
          <div className={styles.headerTitle}>
            <p className={styles.headerParaph}>{windowName}</p>
          </div>
          <div className={styles.headerCross}>
            <button className={styles.crossButton} onClick={crossAction}>
              <Cross
                style={{
                  width: "24px",
                  height: "24px",
                  strokeWidth: "1.5",
                  stroke: "rgb(200, 200, 200)",
                }}
              />
            </button>
          </div>
        </section>
        <section className={styles.body}>{children}</section>
      </motion.div>
    </motion.div>,
    document.body
  );
}
