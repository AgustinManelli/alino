"use client";

import { createPortal } from "react-dom";
import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useConfirmationModalStore } from "@/store/useConfirmationModalStore";

import styles from "./ConfirmationModal.module.css";

export function ConfirmationModal() {
  const ref = useRef<HTMLDivElement>(null);

  const { isOpen, text, aditionalText, actionButton, onConfirm, closeModal } =
    useConfirmationModalStore();

  const handleAccept = () => {
    onConfirm();
    closeModal();
  };

  useOnClickOutside(ref, () => {
    if (isOpen) {
      closeModal();
    }
  });

  const portalRoot = document.getElementById("portal-root");

  if (!portalRoot) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && ( // Solo renderizamos el modal si 'isOpen' es true
        <div
          style={{
            backgroundColor: "rgb(0,0,0,0.3)",
          }}
          className={styles.confirmationModalBackground}
          id="confirmation-modal"
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              transition: { duration: 0.2 },
            }}
            exit={{ scale: 0.5, opacity: 0, transition: { duration: 0.15 } }} // Animación de salida
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
              {aditionalText && (
                <p className={styles.confirmationModalAdditionalText}>
                  {aditionalText}
                </p>
              )}
            </section>
            <section className={styles.confirmationModalButtons}>
              <button
                className={styles.confirmationModalButton}
                onClick={closeModal} // La cancelación solo cierra el modal
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    portalRoot
  );
}
