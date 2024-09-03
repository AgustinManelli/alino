"use client";

import { useRef } from "react";
import styles from "./modalBox.module.css";
import useOnClickOutside from "@/hooks/useOnClickOutside";

interface ModalBoxProps {
  title: string;
  footer: string;
  children: React.ReactNode;
  onClose: () => void;
  iconRef: React.RefObject<HTMLDivElement>;
}

export default function ModalBox({
  title,
  footer,
  children,
  onClose,
  iconRef,
}: ModalBoxProps) {
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
      <p className={styles.title}>{title}</p>
      <div className={styles.separator}></div>
      {children}
      <div className={styles.separator}></div>
      <p className={styles.title}>{footer}</p>
    </div>
  );
}
