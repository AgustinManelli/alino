"use client";

import React, { useState, useEffect } from "react";
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
      customToast.error("No se pudo actualizar la privacidad.");
      setIsPrivate(!nextVal);
      updateUser({ is_private: !nextVal });
    } else {
      customToast.success(
        nextVal
          ? "Cuenta privada activada. Tu perfil no aparecerá en búsquedas."
          : "Cuenta pública. Otros usuarios podrán encontrarte para invitarte."
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
      customToast.error("No se pudo actualizar el ajuste de invitaciones.");
      setAllowListInvites(!nextVal);
      updateUser({ allow_list_invites: !nextVal });
    } else {
      customToast.success(
        nextVal
          ? "Invitaciones permitidas."
          : "Invitaciones bloqueadas. Nadie podrá agregarte a listas compartidas."
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
      customToast.error("No se pudo actualizar el estado de actividad.");
      setShowActivityStatus(!nextVal);
      updateUser({ show_activity_status: !nextVal });
    } else {
      customToast.success(
        nextVal
          ? "Actividad en tiempo real visible para tus colaboradores."
          : "Actividad en tiempo real oculta."
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
        "Sesiones cerradas en todos los demás dispositivos correctamente."
      );
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudieron cerrar las demás sesiones.";
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
        throw new Error(res.error || "Error al recopilar los datos.");
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

      customToast.success("Copia de datos exportada y descargada.");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Error al exportar los datos.";
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

      customToast.success("Tu cuenta ha sido eliminada. Hasta pronto.");
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.clear();
      window.location.href = "/sign-in";
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "No se pudo completar la eliminación.";
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
        <h3 className={userStyles.tabSectionTitle}>Seguridad y Privacidad</h3>
        <p className={userStyles.tabSectionSubtitle}>
          Controla quién puede interactuar contigo, administra tus sesiones y
          resguarda tus datos.
        </p>
      </div>

      <SectionContainer
        sectionTitle="Visibilidad y privacidad"
        sectionDescription="Configura cómo otros usuarios pueden descubrirte o interactuar contigo dentro de Alino."
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span>Cuenta privada</span>
                <span className={styles.infoSubtext}>
                  No aparecerás en las búsquedas de usuarios ni serás sugerido
                  para invitaciones.
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
                <span>Permitir invitaciones a listas</span>
                <span className={styles.infoSubtext}>
                  Si lo desactivas, nadie podrá enviarte solicitudes para unirte a
                  listas compartidas.
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
                <span>Presencia en vivo en listas compartidas</span>
                <span className={styles.infoSubtext}>
                  Muestra cuándo estás activo o completando tareas a los
                  colaboradores de tus listas.
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
        sectionTitle="Sesiones y dispositivos"
        sectionDescription="Administra los accesos activos a tu cuenta en navegadores y teléfonos móviles."
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span>Cerrar sesión en otros dispositivos</span>
                <span className={styles.infoSubtext}>
                  Revoca el acceso en todos los navegadores abiertos excepto en
                  este.
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
                {isSigningOutOthers ? "Cerrando..." : "Cerrar otras sesiones"}
              </button>
            ),
          },
        ]}
      />

      <SectionContainer
        sectionTitle="Portabilidad y copia de seguridad"
        sectionDescription="Descarga una copia completa de tus datos personales, listas, notas y tareas en formato estándar JSON."
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span>Exportar mis datos (JSON)</span>
                <span className={styles.infoSubtext}>
                  Recibirás un archivo descargable con todas tus listas, tareas y
                  configuraciones.
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
                {isExporting ? "Exportando..." : "Descargar datos"}
              </button>
            ),
          },
        ]}
      />

      <SectionContainer
        sectionTitle="Zona de peligro"
        sectionDescription="La eliminación de la cuenta es permanente e irreversible. Todos tus datos se borrarán sin posibilidad de recuperación."
        configElements={[
          {
            text: (
              <div className={styles.infoCol}>
                <span style={{ color: "var(--button-critical)" }}>
                  Eliminar mi cuenta
                </span>
                <span className={styles.infoSubtext}>
                  Elimina permanentemente tu usuario, listas personales,
                  archivos y suscripción activa.
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
                Eliminar cuenta
              </button>
            ),
          },
        ]}
      />

      <AnimatePresence mode="wait">
        {isDeleteModalOpen && (
          <WindowModal
            title="¿Eliminar cuenta permanentemente?"
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
                <strong>Atención:</strong> Esta acción no se puede deshacer. Se
                borrarán todas tus listas, tareas, carpetas compartidas y
                beneficios de suscripción de forma definitiva.
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
                  Para confirmar, escribe tu nombre de usuario{" "}
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
                  Cancelar
                </button>
                <button
                  type="button"
                  className={`${userStyles.btnAction} ${userStyles.btnCritical}`}
                  onClick={handleDeleteAccount}
                  disabled={!isUsernameMatch || isDeleting}
                >
                  {isDeleting ? "Eliminando..." : "Eliminar permanentemente"}
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
