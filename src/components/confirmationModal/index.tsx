"use client";

import { createPortal } from "react-dom";
import styles from "./confirmationModal.module.css";
import { motion } from "motion/react";

export default function ConfirmationModal({
  text,
  aditionalText,
  isDeleteConfirm,
  handleDelete,
  setAllowCloseNavbar,
}: {
  text: string;
  aditionalText: string;
  isDeleteConfirm: (value: boolean) => void;
  handleDelete: () => void;
  setAllowCloseNavbar: (value: boolean) => void;
}) {
  const handleAccept = () => {
    isDeleteConfirm(false);
    setAllowCloseNavbar(true);
    handleDelete();
  };
  const handleCancel = () => {
    isDeleteConfirm(false);
    setAllowCloseNavbar(true);
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
