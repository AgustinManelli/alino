"use client";

import { createPortal } from "react-dom";
import { useRef } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { Cross } from "@/lib/ui/icons";
import styles from "./window-component.module.css";

export default function WindowComponent({
  children,
  windowName,
  crossAction,
}: {
  children?: React.ReactNode;
  windowName: string;
  crossAction: () => void;
}) {
  const windowRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    windowRef,
    () => {
      crossAction();
    },
    windowRef
  );

  return createPortal(
    <div className={styles.container}>
      <div className={styles.window} ref={windowRef}>
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
      </div>
    </div>,
    document.body
  );
}
