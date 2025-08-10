"use client";

import { useState, useRef, useEffect } from "react";
import { useNotificationsStore } from "@/store/useNotificationsStore";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { Alert } from "@/components/ui/icons/icons";
import { toast } from "sonner";

import styles from "./notifications.module.css";

export function NotificationsSection() {
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iconRef = useRef<HTMLDivElement>(null);

  const { notifications, getNotifications } = useNotificationsStore();

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      setIsLoading(true);
      await getNotifications();
      setIsLoading(false);
    };
    fetchInitialNotifications();
  }, [getNotifications]);

  const handleToggle = () => {
    setActive(!active);
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleAccept = async (invitationId: string) => {
    toast.success(`Lógica para aceptar la invitación ${invitationId}`);
    // Aquí implementas la llamada a tu backend/store
    // await acceptInvitation(invitationId);
    // await getNotifications(); // Vuelve a cargar para reflejar cambios
    handleClose(); // Cierra el modal después de la acción
  };

  const handleDecline = async (invitationId: string) => {
    toast.info(`Lógica para rechazar la invitación ${invitationId}`);
    // Aquí implementas la llamada a tu backend/store
    // await declineInvitation(invitationId);
    // await getNotifications();
    handleClose();
  };

  const renderContent = () => {
    if (isLoading) {
      return <p className={styles.statusText}>Cargando...</p>;
    }

    if (!notifications || notifications.length === 0) {
      return <p className={styles.statusText}>No tienes notificaciones</p>;
    }

    return (
      <ul className={styles.notificationList}>
        {notifications.map((inv) => (
          <li key={inv.invitation_id} className={styles.notificationItem}>
            <div className={styles.notificationInfo}>
              <span>
                El usuario {inv.display_name || "Un usuario"} te ha nvitado a la
                lista "{inv.list_name || "una lista"}"
              </span>
            </div>
            <div className={styles.notificationActions}>
              <button
                onClick={() => handleAccept(inv.invitation_id)}
                className={`${styles.actionButton} ${styles.accept}`}
              >
                Aceptar
              </button>
              <button
                onClick={() => handleDecline(inv.invitation_id)}
                className={`${styles.actionButton} ${styles.decline}`}
              >
                Rechazar
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.notificationContainer}>
      <div
        className={styles.notificationButton}
        onClick={handleToggle}
        ref={iconRef}
      >
        <Alert
          style={{ width: "24px", height: "24px", stroke: "var(--icon-color)" }}
        />
        {notifications && notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
        )}
      </div>

      {active && (
        <ModalBox
          title="Notificaciones"
          onClose={handleClose}
          iconRef={iconRef}
        >
          <div className={styles.contentWrapper}>{renderContent()}</div>
        </ModalBox>
      )}
    </div>
  );
}
