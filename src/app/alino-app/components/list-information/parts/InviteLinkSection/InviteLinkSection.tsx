"use client";

import { useCallback, useEffect, useState } from "react";

import {
  createInviteLink,
  getInviteLinks,
  revokeInviteLink,
  type InviteLink,
} from "@/lib/api/list/invite-link-actions";

import { customToast } from "@/lib/toasts";
import CopyToClipboard from "@/components/ui/CopyToClipboard";
import { WindowModal } from "@/components/ui/WindowModal";
import { RoleDropdown } from "../RoleDropdown";

import {
  AddIcon,
  DeleteIcon,
  Link,
  LoadingIcon,
  QrIcon,
} from "@/components/ui/icons/icons";
import styles from "./InviteLinkSection.module.css";

interface Props {
  list_id: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  editor: "Editor",
  reader: "Lector",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "var(--role-admin, #3b82f6)",
  editor: "var(--role-editor, #22c55e)",
  reader: "var(--role-reader, #9ca3af)",
};

function qrUrl(data: string) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(data)}&bgcolor=ffffff&color=1a1a1a&margin=10`;
}

function getInviteUrl(token: string) {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/invite/${token}`;
}

export function InviteLinkSection({ list_id }: Props) {
  const [links, setLinks] = useState<InviteLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [selectedRole, setSelectedRole] = useState<
    "admin" | "editor" | "reader"
  >("editor");
  const [qrModal, setQrModal] = useState<InviteLink | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getInviteLinks(list_id);
    if (error) customToast.error(error);
    else setLinks((data ?? []).filter((l) => l.is_active));
    setLoading(false);
  }, [list_id]);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  const handleCreate = async () => {
    setCreating(true);
    const { data, error } = await createInviteLink(list_id, selectedRole);
    if (error) {
      customToast.error(error);
    } else if (data) {
      customToast.success("Enlace creado");
      await fetchLinks();
    }
    setCreating(false);
  };

  const handleRevoke = async (link: InviteLink) => {
    setRevokingId(link.id);
    const { error } = await revokeInviteLink(link.id);
    if (error) {
      customToast.error(error);
    } else {
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      customToast.success("Enlace revocado");
    }
    setRevokingId(null);
  };

  const activeLinks = links.filter((l) => l.is_active);

  return (
    <div className={styles.wrapper}>
      <div className={styles.createRow}>
        <p className={styles.createLabel}>Rol del enlace</p>
        <div className={styles.controlGroup}>
          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={creating}
            type="button"
          >
            {creating ? (
              <LoadingIcon className={styles.loadingIcon} />
            ) : (
              <AddIcon className={styles.icon} />
            )}
            {creating ? "Creando..." : "Generar enlace"}
          </button>
          <RoleDropdown
            currentRole={selectedRole}
            availableRoles={["admin", "editor", "reader"]}
            onChange={setSelectedRole}
            disabled={creating}
          />
        </div>
      </div>

      <div className={styles.linksSection}>
        {loading ? (
          <div className={styles.skeleton}>
            {[0, 1].map((i) => (
              <div key={i} className={styles.skeletonRow}>
                <div
                  className={styles.skeletonBlock}
                  style={{ width: "60px", borderRadius: "20px" }}
                />
                <div className={styles.skeletonBlock} style={{ flex: 1 }} />
                <div
                  className={styles.skeletonBlock}
                  style={{ width: "80px" }}
                />
              </div>
            ))}
          </div>
        ) : activeLinks.length === 0 ? (
          <div className={styles.emptyState}>
            <Link className={styles.linkIcon} />
            <p>Sin enlaces activos</p>
            <span>Crea uno arriba para compartir la lista</span>
          </div>
        ) : (
          <ul className={styles.linkList}>
            {activeLinks.map((link, i) => (
              <li
                key={link.id}
                className={styles.linkItem}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className={styles.rolePill}
                  style={{
                    color: ROLE_COLORS[link.role],
                    borderColor: ROLE_COLORS[link.role] + "40",
                    backgroundColor: ROLE_COLORS[link.role] + "12",
                  }}
                >
                  {ROLE_LABELS[link.role] ?? link.role}
                </span>

                <span className={styles.tokenPreview}>
                  /invite/{link.token.slice(0, 20)}…
                </span>

                <span className={styles.usesLabel}>
                  {link.used_count} uso{link.used_count !== 1 ? "s" : ""}
                  {link.max_uses != null && ` / ${link.max_uses}`}
                </span>

                <div className={styles.linkActions}>
                  <CopyToClipboard
                    text={getInviteUrl(link.token)}
                    successMessage="Enlace copiado"
                    size={30}
                    className={styles.copyToClipboardIcon}
                    initialBorderStroke="transparent"
                  />

                  <button
                    className={styles.actionBtn}
                    onClick={() => setQrModal(link)}
                    type="button"
                    title="Ver QR"
                  >
                    <QrIcon className={styles.iconActionBtn} />
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => handleRevoke(link)}
                    disabled={revokingId === link.id}
                    type="button"
                    title="Revocar enlace"
                  >
                    {revokingId === link.id ? (
                      <LoadingIcon className={styles.loadingIcon} />
                    ) : (
                      <DeleteIcon className={styles.iconActionBtn} />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {qrModal && (
        <WindowModal
          title="Código QR de invitación"
          closeAction={() => setQrModal(null)}
        >
          <div className={styles.qrBody}>
            <p className={styles.qrSubtitle}>
              Rol:{" "}
              <span style={{ color: ROLE_COLORS[qrModal.role] }}>
                {ROLE_LABELS[qrModal.role]}
              </span>
            </p>

            <div className={styles.qrImageWrap}>
              <img
                src={qrUrl(getInviteUrl(qrModal.token))}
                alt="QR de invitación"
                className={styles.qrImage}
              />
            </div>

            <div className={styles.qrUrlRow}>
              <span className={styles.qrUrl}>
                {getInviteUrl(qrModal.token)}
              </span>
              <CopyToClipboard
                text={getInviteUrl(qrModal.token)}
                successMessage="Enlace copiado"
                size={28}
                initialBorderStroke="transparent"
              />
            </div>

            <p className={styles.qrHint}>
              Cualquier persona con este enlace se unirá como{" "}
              <strong>{ROLE_LABELS[qrModal.role]?.toLowerCase()}</strong>.
            </p>
          </div>
        </WindowModal>
      )}
    </div>
  );
}
