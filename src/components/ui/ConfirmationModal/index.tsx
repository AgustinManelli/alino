"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";

import { ClientOnlyPortal } from "../ClientOnlyPortal";

import styles from "./ConfirmationModal.module.css";

export const ConfirmationModal = () => {
  const ref = useRef<HTMLDivElement>(null);

  const { isOpen, text, additionalText, actionButton, onConfirm, closeModal } =
    useConfirmationModalStore(
      useShallow((state) => ({
        isOpen: state.isOpen,
        text: state.text,
        additionalText: state.additionalText,
        actionButton: state.actionButton,
        onConfirm: state.onConfirm,
        closeModal: state.closeModal,
      }))
    );

  const handleAccept = useCallback(() => {
    onConfirm();
    closeModal();
  }, [isOpen, closeModal]);

  const handleCloseModal = () => {
    closeModal();
  };

  useOnClickOutside(ref, () => {
    if (isOpen) {
      closeModal();
    }
  });

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ClientOnlyPortal>
          <motion.div
            className={`${styles.confirmationModalBackground} ignore-sidebar-close`}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              transition: { duration: 0.2 },
            }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <div className={styles.confirmationModalContainer} ref={ref}>
              <section className={styles.confirmationModalText}>
                <p className={styles.confirmationModalTitle}>{text}</p>
                {additionalText && (
                  <p className={styles.confirmationModalAdditionalText}>
                    {additionalText}
                  </p>
                )}
              </section>
              <section className={styles.confirmationModalButtons}>
                <button
                  className={styles.confirmationModalButton}
                  onClick={handleCloseModal}
                >
                  Cancelar
                </button>
                <button
                  className={`${styles.confirmationModalButton} ${styles.delete}`}
                  onClick={handleAccept}
                >
                  {actionButton}
                </button>
              </section>
            </div>
          </motion.div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
