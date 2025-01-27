"use client";

import { createPortal } from "react-dom";
import { motion } from "motion/react";

import styles from "./ConfirmationModal.module.css";

interface props {
  text: string;
  aditionalText: string;
  isDeleteConfirm: (value: boolean) => void;
  handleDelete: () => void;
  setAllowCloseNavbar?: (value: boolean) => void;
}

export function ConfirmationModal({
  text,
  aditionalText,
  isDeleteConfirm,
  handleDelete,
  setAllowCloseNavbar,
}: props) {
  const handleAccept = () => {
    isDeleteConfirm(false);
    setAllowCloseNavbar && setAllowCloseNavbar(true);
    handleDelete();
  };
  const handleCancel = () => {
    isDeleteConfirm(false);
    setAllowCloseNavbar && setAllowCloseNavbar(true);
  };
  return createPortal(
    <div className={styles.backgroundModal}>
      <motion.div
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 40,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          transition: { duration: 0.2 },
        }}
        exit={{ scale: 0, opacity: 0 }}
        className={styles.modalContainer}
      >
        <section className={styles.modalTexts}>
          <p className={styles.modalTitle}>{text}</p>
          <p className={styles.modalAdditionalText}>{aditionalText}</p>
        </section>
        <section className={styles.modalButtons}>
          <button
            className={styles.modalButton}
            onClick={() => {
              handleCancel();
            }}
          >
            cancelar
          </button>
          <button
            className={styles.modalButton}
            onClick={() => {
              handleAccept();
            }}
          >
            aceptar
          </button>
        </section>
      </motion.div>
    </div>,
    document.body
  );
}
