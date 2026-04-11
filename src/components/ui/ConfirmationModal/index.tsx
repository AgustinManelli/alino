"use client";
import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import styles from "./ConfirmationModal.module.css";

interface SecondaryAction {
  label: string;
  onConfirm: () => void;
}

interface Props {
  text: string;
  additionalText?: string;
  actionButton?: string;
  onConfirm: () => void;
  secondaryAction?: SecondaryAction;
  onClose: () => void;
}

export const ConfirmationModal = ({
  text,
  additionalText,
  actionButton = "Eliminar",
  onConfirm,
  secondaryAction,
  onClose,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);

  const handleAccept = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  const handleSecondaryAccept = useCallback(() => {
    secondaryAction?.onConfirm();
    onClose();
  }, [secondaryAction, onClose]);

  useOnClickOutside(ref, onClose);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <ClientOnlyPortal>
      <motion.div
        className={`${styles.confirmationModalBackground} ignore-sidebar-close`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
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
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              className={`${styles.confirmationModalButton} ${styles.delete}`}
              onClick={handleAccept}
            >
              {actionButton}
            </button>
            {secondaryAction && (
              <button
                className={`${styles.confirmationModalButton} ${styles.delete} ${styles.secondary}`}
                onClick={handleSecondaryAccept}
              >
                {secondaryAction.label}
              </button>
            )}
          </section>
        </div>
      </motion.div>
    </ClientOnlyPortal>
  );
};
