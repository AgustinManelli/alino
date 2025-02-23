"use client";

import { createPortal } from "react-dom";
import { useRef } from "react";
import { motion } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import styles from "./ConfirmationModal.module.css";

interface ConfirmationModalProps {
  text: string;
  aditionalText: string;
  handleDelete: () => void;
  isDeleteConfirm: (value: boolean) => void;
  withBackground?: boolean;
  id?: string;
}

export function ConfirmationModal({
  text,
  aditionalText,
  handleDelete,
  isDeleteConfirm,
  withBackground = true,
  id = "default",
}: ConfirmationModalProps) {
  const ref = useRef<HTMLDivElement>(null);

  const handleAccept = () => {
    isDeleteConfirm(false);
    handleDelete();
  };

  const handleCancel = () => {
    isDeleteConfirm(false);
  };

  useOnClickOutside(ref, () => {
    isDeleteConfirm(false);
  });

  const portalRoot = document.getElementById("portal-root");

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <div
      style={{
        backgroundColor: withBackground ? "rgb(0,0,0,0.3)" : "transparent",
      }}
      className={styles.confirmationModalBackground}
      id={`confirmation-modal-${id}`}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: { duration: 0.2 },
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 40,
        }}
        className={styles.confirmationModalContainer}
        ref={ref}
      >
        <section className={styles.confirmationModalText}>
          <p className={styles.confirmationModalTitle}>{text}</p>
          <p className={styles.confirmationModalAdditionalText}>
            {aditionalText}
          </p>
        </section>
        <section className={styles.confirmationModalButtons}>
          <button
            className={styles.confirmationModalButton}
            onClick={() => {
              handleCancel();
            }}
          >
            Cancelar
          </button>
          <button
            className={`${styles.confirmationModalButton} ${styles.delete}`}
            onClick={() => {
              handleAccept();
            }}
          >
            Eliminar
          </button>
        </section>
      </motion.div>
    </div>,
    portalRoot
  );
}
