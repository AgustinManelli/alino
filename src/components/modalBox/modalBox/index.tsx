"use client";

import { useEffect, useRef } from "react";
import styles from "./modalBox.module.css";

interface ModalBoxProps {
  title: string;
  footer: string;
  children: React.ReactNode;
  onClose: () => void;
}

export default function ModalBox({
  title,
  footer,
  children,
  onClose,
}: ModalBoxProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Función para manejar clics fuera del modal
    const handleClickOutside = (event: MouseEvent) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Añade el event listener al montar el componente
    document.addEventListener("mousedown", handleClickOutside);

    // Limpia el event listener al desmontar el componente
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

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
