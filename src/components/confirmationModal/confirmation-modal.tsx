import { createPortal } from "react-dom";
import styles from "./confirmation-modal.module.css";
import { motion } from "framer-motion";

export default function ConfirmationModal({
  text,
  aditionalText,
  isDeleteConfirm,
  handleDelete,
}: {
  text: string;
  aditionalText: string;
  isDeleteConfirm: (value: boolean) => void;
  handleDelete: () => void;
}) {
  const handleAccept = () => {
    handleDelete();
    isDeleteConfirm(false);
  };
  const handleCancel = () => {
    isDeleteConfirm(false);
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
              handleAccept();
            }}
          >
            aceptar
          </button>
          <button
            className={styles.modalButton}
            onClick={() => {
              handleCancel();
            }}
          >
            cancelar
          </button>
        </section>
      </motion.div>
    </div>,
    document.body
  );
}
