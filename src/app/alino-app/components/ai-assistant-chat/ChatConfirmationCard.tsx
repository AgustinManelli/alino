"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Cross, LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./AIAssistantChat.module.css";

interface Props {
  actionDescription: string;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

export const ChatConfirmationCard = ({
  actionDescription,
  onConfirm,
  onCancel,
}: Props) => {
  const { t } = useTranslation(["assistant"]);
  const [loading, setLoading] = useState(false);
  const [handled, setHandled] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setHandled(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setHandled(true);
    onCancel();
  };

  if (handled) {
    return null;
  }

  return (
    <div className={styles.confirmationCard}>
      <div className={styles.confirmationHeader}>
        <span className={styles.confirmationBadge}>{t("confirmation.badge")}</span>
        <span className={styles.confirmationText}>{t("confirmation.tag")}</span>
      </div>
      <p className={styles.confirmationDescription}>{actionDescription}</p>
      <div className={styles.confirmationActions}>
        <button
          className={`${styles.confirmBtn} ${styles.dangerBtn}`}
          onClick={handleConfirm}
          disabled={loading}
          type="button"
        >
          {loading ? (
            <LoadingIcon style={{ width: 14, height: 14 }} />
          ) : (
            <Check style={{ width: 14, height: 14 }} />
          )}
          <span>{t("confirmation.confirm")}</span>
        </button>
        <button
          className={styles.cancelBtn}
          onClick={handleCancel}
          disabled={loading}
          type="button"
        >
          <Cross style={{ width: 12, height: 12 }} />
          <span>{t("confirmation.cancel")}</span>
        </button>
      </div>
    </div>
  );
};
