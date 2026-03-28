"use client";

import { useRef } from "react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import styles from "./ModalBox.module.css";

interface props {
  title: string;
  user?: boolean;
  subtitle?: string;
  tier?: string; // Prop agregada
  children?: React.ReactNode;
  onClose: () => void;
  iconRef: React.RefObject<HTMLDivElement | HTMLButtonElement>;
}

export function ModalBox({
  title,
  user = false,
  subtitle,
  tier,
  children,
  onClose,
  iconRef,
}: props) {
  const modalRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(modalRef, onClose, [iconRef]);

  console.log(tier);

  return (
    <div className={styles.container} ref={modalRef}>
      <div className={styles.textContainer}>
        <p
          className={styles.title}
          style={{ color: user ? "var(--text)" : "var(--text-not-available)" }}
        >
          {title}
        </p>
        <div className={styles.subtitleWrapper}>
          {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          {/* Mostramos el Badge según el Tier */}
          {tier && (
            <span className={`${styles.tierBadge} ${styles[tier]}`}>
              {tier.toUpperCase()}
            </span>
          )}
        </div>
      </div>
      <div className={styles.separator}></div>
      {children}
    </div>
  );
}
