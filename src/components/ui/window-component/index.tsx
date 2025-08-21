"use client";

import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { Cross } from "@/components/ui/icons/icons";
import styles from "./WindowComponent.module.css";
import Image from "next/image";

const crossIconStyle = {
  width: "24px",
  height: "24px",
  strokeWidth: "1.5",
  stroke: "var(--text-not-available)",
} as React.CSSProperties;

interface WindowComponentProps {
  children?: React.ReactNode;
  windowTitle?: string;
  closeAction?: boolean;
  bgBlur?: boolean;
  id?: string;
  crossAction?: () => void;
}

export function WindowComponent({
  children,
  windowTitle = "window_title",
  closeAction = true,
  bgBlur = false,
  id = "default",
  crossAction = () => {},
}: WindowComponentProps) {
  const windowRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const createdRef = useRef<HTMLElement | null>(null);

  useOnClickOutside(windowRef as any, () => {
    crossAction();
  });

  useEffect(() => {
    // intentamos usar el portal-root existente
    const existing = document.getElementById("portal-root");
    if (existing) {
      setContainer(existing);
      return;
    }

    // si no existe, creamos uno y lo añadimos a body
    const el = document.createElement("div");
    el.setAttribute("id", `portal-root-fallback-${id}`);
    document.body.appendChild(el);
    createdRef.current = el;
    setContainer(el);

    return () => {
      // limpieza al desmontar
      if (createdRef.current && createdRef.current.parentNode) {
        createdRef.current.parentNode.removeChild(createdRef.current);
      }
    };
  }, [id]);

  if (!container) {
    // mientras esperamos el container, no renderizamos nada (evita errores SSR)
    return null;
  }

  return createPortal(
    <motion.div
      key={`window-component-${id}`}
      id={`window-component-${id}`}
      initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      animate={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
      exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={styles.windowContainer}
    >
      {bgBlur && (
        <motion.div
          className={styles.glow}
          initial={{ scale: 0, rotate: 0 }}
          animate={{
            scale: [1, 1.05, 0.95, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            rotate: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            },
            delay: 0.5,
          }}
        >
          <Image
            src="/circle-blur.webp"
            alt="blur circle"
            fill
            style={{
              objectFit: "contain",
              pointerEvents: "none",
              userSelect: "none",
            }}
          />
        </motion.div>
      )}
      <motion.section
        className={styles.windowModal}
        ref={windowRef as any}
        key={"window-component-modal"}
        initial={{ scale: 0.8, opacity: 0, y: -50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
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
          {closeAction && (
            <div className={styles.windowCrossContainer}>
              <button
                className={styles.windowCrossButton}
                onClick={crossAction}
              >
                <Cross style={crossIconStyle} />
              </button>
            </div>
          )}
        </section>
        <section className={styles.windowContent}>{children}</section>
      </motion.section>
    </motion.div>,
    container
  );
}
