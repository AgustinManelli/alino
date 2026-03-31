"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

import { useNotificationsStore } from "@/store/useNotificationsStore";
import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { WindowModal } from "@/components/ui/WindowModal";
import { Alert, LoadingIcon, UserIcon } from "@/components/ui/icons/icons";
import styles from "./NotificationsSection.module.css";

export const NotificationsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iconRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  const [selectedAppUpdate, setSelectedAppUpdate] = useState<any>(null);

  const {
    notifications,
    getNotifications,
    markAsRead,
    deleteNotification,
    addNotification,
    updateInvitation,
  } = useNotificationsStore();

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      await getNotifications();
      setIsLoading(false);
    };
    fetch();
  }, [getNotifications]);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const handleAcceptInvitation = async (notification: any) => {
    await updateInvitation(
      notification.notification_id,
      notification.metadata.invitation_id,
      "accepted",
    );
    toast.success("Invitación aceptada");
  };

  const handleDeclineInvitation = async (notification: any) => {
    await updateInvitation(
      notification.notification_id,
      notification.metadata.invitation_id,
      "rejected",
    );
    toast.success("Invitación rechazada");
  };

  const handleMarkRead = async (notification: any) => {
    await markAsRead(notification.notification_id);
  };

  const handleDelete = async (notification: any) => {
    await deleteNotification(notification.notification_id);
  };

  const handleOpenAppUpdateModal = (notification: any) => {
    setSelectedAppUpdate(notification);
  };

  const handleCloseAppUpdateModal = () => {
    setSelectedAppUpdate(null);
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <LoadingIcon
          style={{
            width: "20px",
            height: "auto",
            stroke: "var(--text-not-available)",
            strokeWidth: 3,
          }}
        />
      );
    }

    if (!notifications || notifications.length === 0) {
      return <p className={styles.statusText}>No tienes notificaciones</p>;
    }

    return (
      <ul className={styles.notificationList}>
        {notifications.map((notification) => (
          <li
            key={notification.notification_id}
            className={`${styles.notificationItem} ${
              notification.type === "app_update"
                ? styles.appUpdateNotification
                : ""
            }`}
            onClick={() => {
              if (notification.type === "app_update") {
                handleOpenAppUpdateModal(notification);
              }
            }}
            style={{
              cursor:
                notification.type === "app_update" ? "pointer" : "default",
            }}
          >
            <div className={styles.notificationInfo}>
              {notification.type === "list_invitation" && (
                <div className={styles.configUserIcon}>
                  {notification.metadata?.inviter_avatar_url ? (
                    <img
                      src={notification.metadata.inviter_avatar_url}
                      alt="avatar"
                      style={{
                        width: "100%",
                        height: "100%",
                        borderRadius: "50%",
                      }}
                    />
                  ) : (
                    <UserIcon style={{ width: "60%", height: "60%" }} />
                  )}
                </div>
              )}

              <span>
                <strong>{notification.title}</strong>
                <br />
                {truncateText(notification.content, 90)}
              </span>
            </div>

            <div className={styles.notificationActions}>
              {notification.type === "list_invitation" && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAcceptInvitation(notification);
                    }}
                    className={`${styles.actionButton} ${styles.accept}`}
                  >
                    Aceptar
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeclineInvitation(notification);
                    }}
                    className={`${styles.actionButton} ${styles.decline}`}
                  >
                    Rechazar
                  </button>
                </>
              )}
              {notification.type === "app_update" && !notification.read && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMarkRead(notification);
                  }}
                  className={`${styles.actionButton} ${styles.markRead}`}
                >
                  Marcar como leído
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(notification);
                }}
                className={`${styles.actionButton} ${styles.delete}`}
              >
                Eliminar
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
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
        onClick={handleToggle}
        ref={iconRef}
      >
        <Alert
          style={{
            width: "20px",
            height: "20px",
            stroke: "var(--icon-color)",
            strokeWidth: 1.5,
          }}
        />
        {notifications.filter((n) => !n.read).length > 0 && (
          <span className={styles.badge}>
            {notifications.filter((n) => !n.read).length}
          </span>
        )}
      </div>

      {isOpen && (
        <ModalBox
          title="Notificaciones"
          onClose={handleClose}
          iconRef={iconRef}
        >
          <div className={styles.contentWrapper}>{renderContent()}</div>
        </ModalBox>
      )}

      {selectedAppUpdate && (
        <WindowModal
          closeAction={handleCloseAppUpdateModal}
          crossButton={false}
        >
          <div className={styles.modal}>
            {selectedAppUpdate.metadata?.image_url && (
              <img
                src={selectedAppUpdate.metadata.image_url}
                alt={selectedAppUpdate.title || "Imagen de actualización"}
                className={styles.modalImage}
                style={{ width: "100%" }}
              />
            )}
            <div className={styles.modalContent}>
              {!selectedAppUpdate.metadata?.image_url && (
                <div className={styles.modalHeader}>
                  <span className={styles.categoryBadge}>
                    {selectedAppUpdate.metadata?.category || "Actualización"}
                  </span>
                  {selectedAppUpdate.metadata?.version && (
                    <span className={styles.versionBadge}>
                      v{selectedAppUpdate.metadata.version}
                    </span>
                  )}
                </div>
              )}
              <h3 className={styles.modalTitle}>{selectedAppUpdate.title}</h3>
              <p className={styles.modalText}>{selectedAppUpdate.content}</p>
              <footer className={styles.modalFooter}>
                <button onClick={handleCloseAppUpdateModal}>Cerrar</button>
              </footer>
            </div>
          </div>
        </WindowModal>
      )}
    </div>
  );
};
