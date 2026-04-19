"use client";

import { useState } from "react";

import { UserWithMembershipRole } from "../../index";
import { RoleDropdown } from "../RoleDropdown";

import styles from "./MemberRow.module.css";
import { Cross, LoadingIcon, TickIcon } from "@/components/ui/icons/icons";

interface MemberRowProps {
  user: UserWithMembershipRole | null;
  isCurrentUser: boolean;
  callerRole: string;
  onRoleChange: (
    userId: string,
    newRole: "admin" | "editor" | "reader",
  ) => Promise<void>;
  onRemove: (userId: string) => Promise<void>;
}

export const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  editor: "Editor",
  reader: "Lector",
};

export const ROLE_CLASS: Record<string, string> = {
  owner: styles.roleOwner,
  admin: styles.roleAdmin,
  editor: styles.roleEditor,
  reader: styles.roleReader,
};

function canEditRole(callerRole: string, targetRole: string): boolean {
  if (targetRole === "owner") return false;
  if (callerRole === "owner") return true;
  if (callerRole === "admin" && targetRole !== "admin") return true;
  return false;
}

function canRemove(
  callerRole: string,
  targetRole: string,
  isCurrentUser: boolean,
): boolean {
  if (isCurrentUser) return false;
  if (targetRole === "owner") return false;
  if (callerRole === "owner") return true;
  if (callerRole === "admin" && targetRole !== "admin") return true;
  return false;
}

function availableRoles(
  callerRole: string,
): Array<"admin" | "editor" | "reader"> {
  if (callerRole === "owner") return ["admin", "editor", "reader"];
  return ["editor", "reader"];
}

export function MemberRow({
  user,
  isCurrentUser,
  callerRole,
  onRoleChange,
  onRemove,
}: MemberRowProps) {
  const [loadingRole, setLoadingRole] = useState(false);
  const [loadingRemove, setLoadingRemove] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(false);

  if (!user) {
    return (
      <div className={styles.memberRow}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.userInfo}>
          <div
            className={styles.skeletonLine}
            style={{ width: "55%", height: "14px", marginBottom: "6px" }}
          />
          <div
            className={styles.skeletonLine}
            style={{ width: "35%", height: "12px" }}
          />
        </div>
      </div>
    );
  }

  const showRoleSelect = canEditRole(callerRole, user.role);
  const showRemove = canRemove(callerRole, user.role, isCurrentUser);

  const handleRoleChange = async (newRole: "admin" | "editor" | "reader") => {
    setLoadingRole(true);
    await onRoleChange(user.user_id, newRole);
    setLoadingRole(false);
  };

  const handleRemoveClick = () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      setTimeout(() => setConfirmRemove(false), 3000);
      return;
    }
    handleConfirmRemove();
  };

  const handleConfirmRemove = async () => {
    setLoadingRemove(true);
    await onRemove(user.user_id);
    setLoadingRemove(false);
    setConfirmRemove(false);
  };

  return (
    <div className={styles.memberRow}>
      <img
        src={user.avatar_url || "/default-avatar.png"}
        alt={user.display_name || "Avatar"}
        className={styles.avatar}
      />

      <div className={styles.userInfo}>
        <p className={styles.displayName}>
          {user.display_name}
          {isCurrentUser && <span className={styles.selfTag}> (tú)</span>}
        </p>
        <p className={styles.username}>@{user.username}</p>
      </div>

      <div className={styles.memberMeta}>
        {showRoleSelect ? (
          <RoleDropdown
            currentRole={user.role}
            availableRoles={availableRoles(callerRole)}
            onChange={handleRoleChange}
            disabled={loadingRole}
          />
        ) : (
          <span
            className={`${styles.roleBadge} ${ROLE_CLASS[user.role] ?? ""}`}
          >
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        )}

        {showRemove && (
          <button
            className={styles.removeBtn}
            onClick={handleRemoveClick}
            disabled={loadingRemove}
            title={confirmRemove ? "Confirmar eliminación" : "Eliminar miembro"}
            aria-label="Eliminar miembro"
          >
            {loadingRemove ? (
              <LoadingIcon className={styles.loadingIcon} />
            ) : confirmRemove ? (
              <TickIcon className={styles.removeBtnIcon} />
            ) : (
              <Cross className={styles.removeBtnIcon} />
            )}
          </button>
        )}
      </div>
    </div>
  );
}
