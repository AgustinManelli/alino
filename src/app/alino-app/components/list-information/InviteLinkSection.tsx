"use client";
import { useCallback, useEffect, useState } from "react";
import styles from "./InviteLinkSection.module.css";
import {
  createInviteLink,
  getInviteLinks,
  revokeInviteLink,
  type InviteLink,
} from "@/lib/api/list/invite-link-actions";
import { toast } from "sonner";
import { RoleDropdown } from "./parts/RoleDropdown";

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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    const { data, error } = await getInviteLinks(list_id);
    if (error) toast.error(error);
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
      toast.error(error);
    } else if (data) {
      toast.success("Enlace creado");
      await fetchLinks();
    }
    setCreating(false);
  };

  const handleCopy = async (link: InviteLink) => {
    const url = getInviteUrl(link.token);
    await navigator.clipboard.writeText(url);
    setCopiedId(link.id);
    toast.success("Enlace copiado");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = async (link: InviteLink) => {
    setRevokingId(link.id);
    const { error } = await revokeInviteLink(link.id);
    if (error) {
      toast.error(error);
    } else {
      setLinks((prev) => prev.filter((l) => l.id !== link.id));
      toast.success("Enlace revocado");
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
            {creating ? <SpinnerIcon /> : <PlusIcon />}
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
            <LinkIcon />
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
                  /invite/{link.token.slice(0, 8)}…
                </span>

                <span className={styles.usesLabel}>
                  {link.used_count} uso{link.used_count !== 1 ? "s" : ""}
                  {link.max_uses != null && ` / ${link.max_uses}`}
                </span>

                <div className={styles.linkActions}>
                  <button
                    className={`${styles.actionBtn} ${copiedId === link.id ? styles.actionBtnSuccess : ""}`}
                    onClick={() => handleCopy(link)}
                    type="button"
                    title="Copiar enlace"
                  >
                    {copiedId === link.id ? <CheckIcon /> : <CopyIcon />}
                  </button>

                  <button
                    className={styles.actionBtn}
                    onClick={() => setQrModal(link)}
                    type="button"
                    title="Ver QR"
                  >
                    <QrIcon />
                  </button>

                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => handleRevoke(link)}
                    disabled={revokingId === link.id}
                    type="button"
                    title="Revocar enlace"
                  >
                    {revokingId === link.id ? (
                      <SpinnerIcon size={13} />
                    ) : (
                      <TrashIcon />
                    )}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {qrModal && (
        <div className={styles.qrOverlay} onClick={() => setQrModal(null)}>
          <div className={styles.qrCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.qrHeader}>
              <div>
                <p className={styles.qrTitle}>Código QR de invitación</p>
                <p className={styles.qrSubtitle}>
                  Rol:{" "}
                  <span style={{ color: ROLE_COLORS[qrModal.role] }}>
                    {ROLE_LABELS[qrModal.role]}
                  </span>
                </p>
              </div>
              <button
                className={styles.qrClose}
                onClick={() => setQrModal(null)}
                type="button"
              >
                <CrossIcon />
              </button>
            </div>

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
              <button
                className={`${styles.actionBtn} ${copiedId === qrModal.id ? styles.actionBtnSuccess : ""}`}
                onClick={() => handleCopy(qrModal)}
                type="button"
                title="Copiar"
              >
                {copiedId === qrModal.id ? <CheckIcon /> : <CopyIcon />}
              </button>
            </div>

            <p className={styles.qrHint}>
              Cualquier persona con este enlace se unirá como{" "}
              <strong>{ROLE_LABELS[qrModal.role]?.toLowerCase()}</strong>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PlusIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function CopyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function QrIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <line x1="14" y1="14" x2="14" y2="14" />
      <line x1="17" y1="14" x2="17" y2="14" />
      <line x1="21" y1="14" x2="21" y2="14" />
      <line x1="14" y1="17" x2="14" y2="17" />
      <line x1="17" y1="17" x2="17" y2="21" />
      <line x1="21" y1="17" x2="21" y2="21" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}
function CrossIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function LinkIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}
function SpinnerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      style={{ animation: "spin .7s linear infinite" }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
  );
}
