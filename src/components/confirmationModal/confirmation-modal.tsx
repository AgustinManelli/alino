import { createPortal } from "react-dom";
import styles from "./confirmation-modal.module.css";

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
      <div className={styles.modalContainer}>
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
      </div>
    </div>,
    document.body
  );
}
