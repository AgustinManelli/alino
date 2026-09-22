"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { Switch } from "@/components/ui/switch";
import { WindowModal } from "@/components/ui/WindowModal";
import { customToast } from "@/lib/toasts";
import { createClient } from "@/utils/supabase/client";
import { UserType } from "@/lib/schemas/database.types";
import {
  updateUserSecuritySettingsAction,
  exportUserDataAction,
  deleteAccountAction,
} from "@/lib/api/user/actions";
import styles from "@/app/alino-app/components/config-modal/AccountConfigSection.module.css";
import userStyles from "../ConfigUser.module.css";

interface SecurityTabProps {
  user: UserType | null;
  updateUser: (partial: Partial<UserType>) => void;
}

export function SecurityTab({ user, updateUser }: SecurityTabProps) {
  const { t } = useTranslation(["config", "common"]);
  const [isPrivate, setIsPrivate] = useState<boolean>(
    user?.is_private ?? false
  );
  const [allowListInvites, setAllowListInvites] = useState<boolean>(
    user?.allow_list_invites ?? true
  );
  const [showActivityStatus, setShowActivityStatus] = useState<boolean>(
    user?.show_activity_status ?? true
  );

  const [isSigningOutOthers, setIsSigningOutOthers] = useState(false);

  const [isExporting, setIsExporting] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmUsernameInput, setConfirmUsernameInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      if (typeof user.is_private === "boolean") {
        setIsPrivate(user.is_private);
      }
      if (typeof user.allow_list_invites === "boolean") {
        setAllowListInvites(user.allow_list_invites);
      }
      if (typeof user.show_activity_status === "boolean") {
        setShowActivityStatus(user.show_activity_status);
      }
    }
  }, [user?.is_private, user?.allow_list_invites, user?.show_activity_status]);

  const handleTogglePrivate = async () => {
    const nextVal = !isPrivate;
    setIsPrivate(nextVal);
    updateUser({ is_private: nextVal });

    const res = await updateUserSecuritySettingsAction({ is_private: nextVal });
    if (res.error) {
      customToast.error(t("config:account.security.visibility.privateError"));
      setIsPrivate(!nextVal);
      updateUser({ is_private: !nextVal });
    } else {
      customToast.success(
        nextVal
          ? t("config:account.security.visibility.privateSuccessOn")
          : t("config:account.security.visibility.privateSuccessOff")
      );
    }
  };

  const handleToggleAllowInvites = async () => {
    const nextVal = !allowListInvites;
    setAllowListInvites(nextVal);
    updateUser({ allow_list_invites: nextVal });

    const res = await updateUserSecuritySettingsAction({
      allow_list_invites: nextVal,
    });
    if (res.error) {
      customToast.error(t("config:account.security.visibility.listInvitesError"));
      setAllowListInvites(!nextVal);
      updateUser({ allow_list_invites: !nextVal });
    } else {
      customToast.success(
        nextVal
          ? t("config:account.security.visibility.listInvitesSuccessOn")
          : t("config:account.security.visibility.listInvitesSuccessOff")
      );
    }
  };

  const handleToggleActivityStatus = async () => {
    const nextVal = !showActivityStatus;
    setShowActivityStatus(nextVal);
    updateUser({ show_activity_status: nextVal });

    const res = await updateUserSecuritySettingsAction({
      show_activity_status: nextVal,
    });
    if (res.error) {
      customToast.error(t("config:account.security.visibility.activityStatusError"));
      setShowActivityStatus(!nextVal);
      updateUser({ show_activity_status: !nextVal });
    } else {
      customToast.success(
        nextVal
          ? t("config:account.security.visibility.activityStatusSuccessOn")
          : t("config:account.security.visibility.activityStatusSuccessOff")
      );
    }
  };

  const handleSignOutOthers = async () => {
    setIsSigningOutOthers(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut({ scope: "others" });
      if (error) throw error;
      customToast.success(
        t("config:account.security.sessions.signOutSuccess")
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : t("config:account.security.sessions.signOutError");
      customToast.error(msg);
    } finally {
      setIsSigningOutOthers(false);
    }
  };

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const res = await exportUserDataAction();
      if (res.error || !res.data) {
        throw new Error(res.error || t("config:account.security.export.exportError"));
      }

      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(res.data, null, 2)
      )}`;
      const downloadAnchor = document.createElement("a");
      const dateStr = new Date().toISOString().split("T")[0];
      const filename = `alino-backup-${user?.username || "usuario"}-${dateStr}.json`;

      downloadAnchor.setAttribute("href", jsonString);
      downloadAnchor.setAttribute("download", filename);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      customToast.success(t("config:account.security.export.exportSuccess"));
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : t("config:account.security.export.exportError");
      customToast.error(msg);
    } finally {
      setIsExporting(false);
    }
  };

  const targetUsername = (user?.username || "").trim();
  const isUsernameMatch =
    confirmUsernameInput.trim().toLowerCase() === targetUsername.toLowerCase();

  const handleDeleteAccount = async () => {
    if (!isUsernameMatch || isDeleting) return;

    setIsDeleting(true);
    try {
      const res = await deleteAccountAction(confirmUsernameInput.trim());
      if (res.error) {
        throw new Error(res.error);
      }

      customToast.success(t("config:account.security.dangerZone.deleteSuccess"));
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/sign-in";
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : t("config:account.security.dangerZone.deleteError");
      customToast.error(msg);
      setIsDeleting(false);
    }
  };

  return (
    <motion.div
      className={userStyles.tabContainer}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div className={userStyles.tabHeaderBlock}>
        <h3 className={userStyles.tabSectionTitle}>
          {t("config:account.security.title")}
        </h3>
        <p className={userStyles.tabSectionSubtitle}>
          {t("config:account.security.subtitle")}
        </p>
      </div>

      <SectionContainer
        sectionTitle={t("config:account.security.visibility.title")}
        sectionDescription={t("config:account.security.visibility.desc")}
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span>{t("config:account.security.visibility.privateAccount")}</span>
                <span className={styles.infoSubtext}>
                  {t("config:account.security.visibility.privateAccountDesc")}
                </span>
              </div>
            ),
            elementAction: (
              <Switch
                value={isPrivate}
                action={handleTogglePrivate}
                width={40}
              />
            ),
          },
          {
            text: (
              <div className={styles.infoCol}>
                <span>{t("config:account.security.visibility.listInvites")}</span>
                <span className={styles.infoSubtext}>
                  {t("config:account.security.visibility.listInvitesDesc")}
                </span>
              </div>
            ),
            elementAction: (
              <Switch
                value={allowListInvites}
                action={handleToggleAllowInvites}
                width={40}
              />
            ),
          },
          {
            text: (
              <div className={styles.infoCol}>
                <span>{t("config:account.security.visibility.activityStatus")}</span>
                <span className={styles.infoSubtext}>
                  {t("config:account.security.visibility.activityStatusDesc")}
                </span>
              </div>
            ),
            elementAction: (
              <Switch
                value={showActivityStatus}
                action={handleToggleActivityStatus}
                width={40}
              />
            ),
          },
        ]}
      />

      <SectionContainer
        sectionTitle={t("config:account.security.sessions.title")}
        sectionDescription={t("config:account.security.sessions.desc")}
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span>{t("config:account.security.sessions.signOutOthers")}</span>
                <span className={styles.infoSubtext}>
                  {t("config:account.security.sessions.signOutOthersDesc")}
                </span>
              </div>
            ),
            elementAction: (
              <button
                type="button"
                className={userStyles.btnAction}
                onClick={handleSignOutOthers}
                disabled={isSigningOutOthers}
              >
                {isSigningOutOthers
                  ? t("config:account.security.sessions.signingOut")
                  : t("config:account.security.sessions.signOutBtn")}
              </button>
            ),
          },
        ]}
      />

      <SectionContainer
        sectionTitle={t("config:account.security.export.title")}
        sectionDescription={t("config:account.security.export.desc")}
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span>{t("config:account.security.export.exportLabel")}</span>
                <span className={styles.infoSubtext}>
                  {t("config:account.security.export.exportDesc")}
                </span>
              </div>
            ),
            elementAction: (
              <button
                type="button"
                className={userStyles.btnAction}
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting
                  ? t("config:account.security.export.exporting")
                  : t("config:account.security.export.exportBtn")}
              </button>
            ),
          },
        ]}
      />

      <SectionContainer
        sectionTitle={t("config:account.security.dangerZone.title")}
        sectionDescription={t("config:account.security.dangerZone.desc")}
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span style={{ color: "var(--button-critical)" }}>
                  {t("config:account.security.dangerZone.deleteLabel")}
                </span>
                <span className={styles.infoSubtext}>
                  {t("config:account.security.dangerZone.deleteDesc")}
                </span>
              </div>
            ),
            elementAction: (
              <button
                type="button"
                className={`${userStyles.btnAction} ${userStyles.btnCriticalOutline}`}
                onClick={() => {
                  setConfirmUsernameInput("");
                  setIsDeleteModalOpen(true);
                }}
              >
                {t("config:account.security.dangerZone.deleteBtn")}
              </button>
            ),
          },
        ]}
      />

      <AnimatePresence mode="wait">
        {isDeleteModalOpen && (
          <WindowModal
            title={t("config:account.security.dangerZone.modalTitle")}
            crossButton={false}
            closeAction={() => {
              if (!isDeleting) setIsDeleteModalOpen(false);
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                padding: "16px 20px 22px 20px",
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(240, 80, 80, 0.08)",
                  border: "1px solid rgba(240, 80, 80, 0.25)",
                  borderRadius: "12px",
                  padding: "14px",
                  fontSize: "13px",
                  color: "var(--text)",
                  lineHeight: "1.4",
                }}
              >
                {t("config:account.security.dangerZone.warning")}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    fontWeight: "600",
                    color: "var(--text)",
                  }}
                >
                  {t("config:account.security.dangerZone.confirmPrompt")}{" "}
                  <code
                    style={{
                      backgroundColor: "var(--background-over-container)",
                      padding: "2px 6px",
                      borderRadius: "6px",
                      color: "var(--text)",
                    }}
                  >
                    {targetUsername}
                  </code>
                  :
                </label>
                <input
                  type="text"
                  value={confirmUsernameInput}
                  onChange={(e) => setConfirmUsernameInput(e.target.value)}
                  placeholder={targetUsername}
                  disabled={isDeleting}
                  autoFocus
                  style={{
                    height: "38px",
                    padding: "0 12px",
                    borderRadius: "10px",
                    backgroundColor: "var(--background-container)",
                    border: "1px solid var(--border-container-color)",
                    color: "var(--text)",
                    fontSize: "14px",
                    outline: "none",
                  }}
                />
              </div>

              <div className={userStyles.avatarModalActions}>
                <button
                  type="button"
                  className={userStyles.btnAction}
                  onClick={() => setIsDeleteModalOpen(false)}
                  disabled={isDeleting}
                >
                  {t("config:account.security.dangerZone.cancel")}
                </button>
                <button
                  type="button"
                  className={`${userStyles.btnAction} ${userStyles.btnCritical}`}
                  onClick={handleDeleteAccount}
                  disabled={!isUsernameMatch || isDeleting}
                >
                  {isDeleting
                    ? t("config:account.security.dangerZone.deleting")
                    : t("config:account.security.dangerZone.confirmDelete")}
                </button>
              </div>
            </div>
          </WindowModal>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

interface ConfigElement {
  text: JSX.Element;
  elementAction?: JSX.Element;
}

interface SectionProps {
  sectionTitle: string;
  sectionDescription?: string;
  configElements: ConfigElement[];
}

function SectionContainer({
  sectionTitle,
  sectionDescription,
  configElements,
}: SectionProps) {
  return (
    <section className={styles.sectionContainer}>
      <p className={styles.sectionTitle}>{sectionTitle}</p>
      <section className={styles.sectionContent}>
        {configElements.map((element, index) => (
          <React.Fragment key={index}>
            <div className={styles.sectionElement}>
              <div className={styles.sectionText}>{element.text}</div>
              {element.elementAction && (
                <div className={styles.sectionAction}>
                  {element.elementAction}
                </div>
              )}
            </div>
            {configElements.length !== index + 1 && (
              <div className={styles.configElementSeparator} />
            )}
          </React.Fragment>
        ))}
      </section>
      {sectionDescription && (
        <p className={styles.sectionDescription}>{sectionDescription}</p>
      )}
    </section>
  );
}
