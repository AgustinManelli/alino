"use client";

import { useRef } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import styles from "./ModalBox.module.css";

interface Props {
  title?: string;
  user?: boolean;
  children?: React.ReactNode;
  onClose: () => void;
  iconRef: React.RefObject<HTMLDivElement | HTMLButtonElement>;
  headerSlot?: React.ReactNode;
}

export function ModalBox({
  title,
  user = false,
  children,
  onClose,
  iconRef,
  headerSlot,
}: Props) {
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onClose, [iconRef]);

  const showDefaultHeader = !headerSlot && title;

  return (
    <div className={styles.container} ref={modalRef}>
      {headerSlot && <div className={styles.customHeader}>{headerSlot}</div>}

      {showDefaultHeader && (
        <div className={styles.textContainer}>
          <p
            className={styles.title}
            style={{
              color: user ? "var(--text)" : "var(--text-not-available)",
            }}
          >
            {title}
          </p>
        </div>
      )}

      {children}
    </div>
  );
}
