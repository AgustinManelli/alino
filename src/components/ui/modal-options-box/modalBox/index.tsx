"use client";

import { useRef } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import styles from "./ModalBox.module.css";

interface props {
  title: string;
  user: boolean;
  subtitle?: string;
  children: React.ReactNode;
  onClose: () => void;
  iconRef: React.RefObject<HTMLDivElement>;
}

export function ModalBox({
  title,
  user = false,
  subtitle,
  children,
  onClose,
  iconRef,
}: props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(
    modalRef,
    () => {
      onClose();
    },
    iconRef
  );

  return (
    <div className={styles.container} ref={modalRef}>
      <div className={styles.textContainer}>
        <p
          className={styles.title}
          style={{ color: user ? "var(--text)" : "var(--text-not-available)" }}
        >
          {title}
        </p>
        {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
      </div>
      <div className={styles.separator}></div>
      {children}
    </div>
  );
}
