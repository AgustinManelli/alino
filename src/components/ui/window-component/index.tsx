"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef } from "react";
import { motion } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { Cross } from "@/components/ui/icons/icons";
import styles from "./WindowComponent.module.css";

const crossIconStyle = {
  width: "24px",
  height: "24px",
  strokeWidth: "1.5",
  stroke: "var(--text-not-available)",
} as React.CSSProperties;

interface WindowComponentProps {
  children?: React.ReactNode;
  windowTitle?: string;
  id?: string;
  crossAction?: () => void;
}

export function WindowComponent({
  children,
  windowTitle = "window_title",
  id = "default",
  crossAction = () => {},
}: WindowComponentProps) {
  const windowRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(windowRef, () => {
    crossAction();
  });

  const portalRoot = document.getElementById("portal-root");

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <motion.div
      key={`window-component-${id}`}
      id={`window-component-${id}`}
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
      className={styles.windowContainer}
    >
      <motion.section
        className={styles.windowModal}
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
        <section className={styles.windowHeader}>
          <div className={styles.windowTitle}>
            <p className={styles.windowParaph}>{windowTitle}</p>
          </div>
          <div className={styles.windowCrossContainer}>
            <button className={styles.windowCrossButton} onClick={crossAction}>
              <Cross style={crossIconStyle} />
            </button>
          </div>
        </section>
        <section className={styles.windowContent}>{children}</section>
      </motion.section>
    </motion.div>,
    portalRoot
  );
}
