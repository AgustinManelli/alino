"use client";

import { useState } from "react";
import type { PendingInvitation } from "@/lib/api/list/actions";

import styles from "./PendingInvitationRow.module.css";
import { Cross, LoadingIcon, TickIcon } from "@/components/ui/icons/icons";

interface PendingInvitationRowProps {
  invitation: PendingInvitation | null;
  onCancel: (invitationId: string) => Promise<void>;
}

export function PendingInvitationRow({
  invitation,
  onCancel,
}: PendingInvitationRowProps) {
  const [loading, setLoading] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  if (!invitation) {
    return (
      <div className={styles.invitationRow}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.userInfo}>
          <div
            className={styles.skeletonLine}
            style={{ width: "50%", height: "14px", marginBottom: "6px" }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: "30%", height: "12px" }}
          />
        </div>
      </div>
    );
  }

  const sentDate = new Date(invitation.created_at).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });

  const handleCancelClick = () => {
    if (!confirmCancel) {
      setConfirmCancel(true);
      setTimeout(() => setConfirmCancel(false), 3000);
      return;
    }
    handleConfirmCancel();
  };

  const handleConfirmCancel = async () => {
    setLoading(true);
    await onCancel(invitation.invitation_id);
    setLoading(false);
    setConfirmCancel(false);
  };

  return (
    <div className={styles.invitationRow}>
      <img
        src={invitation.invited_avatar_url || "/default-avatar.png"}
        alt={invitation.invited_display_name}
        className={styles.avatar}
      />

      <div className={styles.userInfo}>
        <p className={styles.displayName}>{invitation.invited_display_name}</p>
        <p className={styles.username}>@{invitation.invited_username}</p>

        <div className={styles.invitedByRow}>
          <img
            src={invitation.inviter_avatar_url || "/default-avatar.png"}
            alt={invitation.inviter_display_name}
            className={styles.inviterAvatar}
          />
          <span className={styles.invitedByText}>
            Invitado por <strong>{invitation.inviter_display_name}</strong> el{" "}
            {sentDate}
          </span>
        </div>
      </div>

      <div className={styles.invitationMeta}>
        <span className={styles.pendingBadge}>Pendiente</span>
        <button
          className={styles.cancelBtn}
          onClick={handleCancelClick}
          disabled={loading}
          title={
            confirmCancel ? "Confirmar cancelación" : "Cancelar invitación"
          }
          aria-label="Cancelar invitación"
        >
          {loading ? (
            <LoadingIcon className={styles.loadingIcon} />
          ) : confirmCancel ? (
            <TickIcon className={styles.removeBtnIcon} />
          ) : (
            <Cross className={styles.removeBtnIcon} />
          )}
        </button>
      </div>
    </div>
  );
}
