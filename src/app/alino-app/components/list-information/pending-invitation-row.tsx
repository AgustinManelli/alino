"use client";
import { useState } from "react";
import type { PendingInvitation } from "@/lib/api/list/actions";
import styles from "./ListInformation.module.css";

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
      </div>

      <div className={styles.invitationMeta}>
        <span className={styles.pendingBadge}>Pendiente</span>
        <span className={styles.invitedBy}>{sentDate}</span>
      </div>

      <button
        className={styles.cancelBtn}
        onClick={handleCancelClick}
        disabled={loading}
        title={confirmCancel ? "Confirmar cancelación" : "Cancelar invitación"}
        aria-label="Cancelar invitación"
      >
        {loading ? (
          <SpinnerIcon />
        ) : confirmCancel ? (
          <ConfirmIcon />
        ) : (
          <XIcon />
        )}
      </button>
    </div>
  );
}

function XIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ConfirmIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: "spin 0.7s linear infinite" }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
