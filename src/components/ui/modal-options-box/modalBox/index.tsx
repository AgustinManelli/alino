"use client";

import { useRef } from "react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import styles from "./ModalBox.module.css";

interface props {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  iconRef: React.RefObject<HTMLDivElement>;
}

export function ModalBox({ title, children, onClose, iconRef }: props) {
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
    </div>
  );
}
