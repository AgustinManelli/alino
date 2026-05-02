"use client";
import { useRef } from "react";
import { createPortal } from "react-dom";
import { useModalBoxUbication } from "@/hooks/useModalBoxUbication";
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
  useModalBoxUbication(iconRef, modalRef, onClose);

  const content = (
    <div ref={modalRef} className={styles.container}>
      {headerSlot && <div className={styles.customHeader}>{headerSlot}</div>}
      {!headerSlot && title && (
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

  const portalRoot = document.getElementById("portal-root");
  if (!portalRoot) return null;

  return createPortal(content, portalRoot);
}
