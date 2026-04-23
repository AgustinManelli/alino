"use client";

import { useState, useRef, useEffect } from "react";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { useNotifications } from "@/hooks/notifications/useNotifications";
import { ModalBox } from "@/components/ui/modal-options-box";
import { WindowModal } from "@/components/ui/WindowModal";
import {
  LoadingIcon,
  UserIcon,
  Alert,
  DeleteIcon,
} from "@/components/ui/icons/icons";
import {
  Notification,
  getNotificationDisplay,
} from "@/lib/schemas/notification.types";
import { formatRelativeTime, formatFullDate } from "@/utils/FormatRelativeTime";
import styles from "./NotificationsSection.module.css";
import { customToast } from "@/lib/toasts";

export const NotificationsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppUpdate, setSelectedAppUpdate] =
    useState<Notification | null>(null);
  const iconRef = useRef<HTMLDivElement>(null);

  const {
    notifications,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    updateInvitation,
  } = useNotifications();

  const initialFetch = useNotificationsStore((s) => s.initialFetch);
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!initialFetch) {
      setIsLoading(true);
      fetchNotifications().then(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [fetchNotifications, initialFetch]);

  const handleToggle = () => setIsOpen((prev) => !prev);
  const handleClose = () => setIsOpen(false);

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    await markAllAsRead();
    customToast.success("Todas marcadas como leídas");
  };

  const handleAcceptInvitation = async (n: Notification) => {
    if (!n.metadata.invitation_id) return;
    await updateInvitation(
      n.notification_id,
      n.metadata.invitation_id,
      "accepted",
    );
    customToast.success("Invitación aceptada");
  };

  const handleDeclineInvitation = async (n: Notification) => {
    if (!n.metadata.invitation_id) return;
    await updateInvitation(
      n.notification_id,
      n.metadata.invitation_id,
      "rejected",
    );
    customToast.success("Invitación rechazada");
  };

  const handleMarkRead = async (n: Notification) => {
    await markAsRead(n.notification_id);
  };

  const handleDelete = async (n: Notification) => {
    await deleteNotification(n.notification_id);
  };

  const handleOpenAppUpdate = (n: Notification) => {
    setSelectedAppUpdate(n);
    if (!n.read) handleMarkRead(n);
  };

  const NotifIcon = ({ notification }: { notification: Notification }) => {
    if (notification.type === "list_invitation") {
      return (
        <div className={styles.avatarWrap}>
          {notification.metadata?.inviter_avatar_url ? (
            <img
              src={notification.metadata.inviter_avatar_url}
              alt="avatar"
              className={styles.avatarImg}
            />
          ) : (
            <UserIcon style={{ width: "55%", height: "55%" }} />
          )}
        </div>
      );
    }
    if (notification.type === "app_update") {
      return (
        <div className={`${styles.avatarWrap} ${styles.iconAppUpdate}`}>
          <Alert
            style={{
              width: "55%",
              height: "55%",
              stroke: "currentColor",
              strokeWidth: 1.5,
            }}
          />
        </div>
      );
    }
    return (
      <div className={`${styles.avatarWrap} ${styles.iconSystem}`}>
        <Alert
          style={{
            width: "55%",
            height: "55%",
            stroke: "currentColor",
            strokeWidth: 1.5,
          }}
        />
      </div>
    );
  };

  const headerSlot = (
    <div className={styles.notifHeader}>
      <div className={styles.headerLeft}>
        <span className={styles.headerTitle}>Notificaciones</span>
        {unreadCount > 0 && (
          <span className={styles.headerBadge}>{unreadCount}</span>
        )}
      </div>
      <button
        className={styles.markAllBtn}
        onClick={handleMarkAllRead}
        disabled={unreadCount === 0}
        title="Marcar todas como leídas"
      >
        <span>Marcar todo leído</span>
      </button>
    </div>
  );

  const renderList = () => {
    if (isLoading) {
      return (
        <div className={styles.centerState}>
          <LoadingIcon
            style={{
              width: "20px",
              height: "auto",
              stroke: "var(--text-not-available)",
              strokeWidth: 2,
            }}
          />
        </div>
      );
    }

    if (!notifications || notifications.length === 0) {
      return (
        <div className={styles.emptyState}>
          <span className={styles.emptyEmoji}>
            <Alert />
          </span>
          <p className={styles.emptyTitle}>Sin notificaciones</p>
          <p className={styles.emptySubtitle}>Estás al día por ahora</p>
        </div>
      );
    }

    return (
      <ul className={styles.list}>
        {notifications.map((notification) => {
          const display = getNotificationDisplay(notification);
          const isInvitation = notification.type === "list_invitation";
          const isInvitationPending =
            isInvitation &&
            (notification.metadata?.invitation_status === "pending" ||
              notification.metadata?.invitation_status == null);
          const isAppUpdate = notification.type === "app_update";
          const isUnread = !notification.read;

          return (
            <li
              key={notification.notification_id}
              className={`
                ${styles.item}
                ${isUnread ? styles.itemUnread : styles.itemRead}
                ${isAppUpdate ? styles.itemAppUpdate : ""}
              `}
              onClick={() => isAppUpdate && handleOpenAppUpdate(notification)}
              style={{ cursor: isAppUpdate ? "pointer" : "default" }}
            >
              <div className={styles.itemRow}>
                <NotifIcon notification={notification} />

                <div className={styles.itemBody}>
                  <div className={styles.itemTopLine}>
                    <span className={styles.itemTitle}>{display.title}</span>
                    <time
                      className={styles.itemTime}
                      title={formatFullDate(notification.created_at)}
                    >
                      {formatRelativeTime(notification.created_at)}{" "}
                      {isUnread && <span className={styles.unreadDot} />}
                    </time>
                  </div>
                  <p className={styles.itemContent}>
                    {truncate(display.content, 82)}
                  </p>
                </div>
              </div>

              <div className={styles.actions}>
                {isInvitationPending && (
                  <>
                    <button
                      className={`${styles.actionBtn} ${styles.btnDecline}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeclineInvitation(notification);
                      }}
                    >
                      Rechazar
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.btnAccept}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAcceptInvitation(notification);
                      }}
                    >
                      Aceptar
                    </button>
                  </>
                )}

                {!isInvitation && isUnread && (
                  <button
                    className={`${styles.actionBtn} ${styles.btnRead}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMarkRead(notification);
                    }}
                  >
                    Marcar leída
                  </button>
                )}

                <button
                  className={`${styles.actionBtn} ${styles.btnDelete}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(notification);
                  }}
                  title="Eliminar notificación"
                >
                  <DeleteIcon style={{ height: 15, width: 15 }} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className={styles.container}>
      <div
        className={styles.triggerBtn}
        style={{
          backgroundColor: isOpen
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
        }}
        onClick={handleToggle}
        ref={iconRef}
        role="button"
        aria-label="Notificaciones"
        aria-expanded={isOpen}
      >
        <Alert
          style={{
            width: "20px",
            height: "20px",
            stroke: "var(--icon-color)",
            strokeWidth: 1.5,
          }}
        />
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </div>

      {isOpen && (
        <ModalBox
          onClose={handleClose}
          iconRef={iconRef}
          headerSlot={headerSlot}
        >
          <div className={styles.listWrapper}>{renderList()}</div>
        </ModalBox>
      )}

      {selectedAppUpdate && (
        <WindowModal
          closeAction={() => setSelectedAppUpdate(null)}
          crossButton={false}
        >
          <div className={styles.detailModal}>
            {selectedAppUpdate.metadata?.image_url && (
              <img
                src={selectedAppUpdate.metadata.image_url}
                alt={selectedAppUpdate.title || "Imagen de actualización"}
                className={styles.detailImage}
              />
            )}
            <div className={styles.detailContent}>
              {!selectedAppUpdate.metadata?.image_url && (
                <div className={styles.detailMeta}>
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
              <h3 className={styles.detailTitle}>{selectedAppUpdate.title}</h3>
              <p className={styles.detailText}>{selectedAppUpdate.content}</p>
              <footer className={styles.detailFooter}>
                <button onClick={() => setSelectedAppUpdate(null)}>
                  Cerrar
                </button>
              </footer>
            </div>
          </div>
        </WindowModal>
      )}
    </div>
  );
};

function truncate(text: string, max: number) {
  if (!text) return "";
  if (text.length <= max) return text;
  return text.substring(0, max).trimEnd() + "…";
}
