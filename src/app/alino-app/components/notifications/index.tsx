"use client";

import { useState, useRef, useEffect } from "react";
import { useNotificationsStore } from "@/store/useNotificationsStore";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";
import { Alert, UserIcon } from "@/components/ui/icons/icons";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/schemas/todo-schema";

import styles from "./notifications.module.css";
import { toast } from "sonner";

type InvitationRow = Database["public"]["Tables"]["list_invitations"]["Row"];

export function NotificationsSection() {
  const [active, setActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const iconRef = useRef<HTMLDivElement>(null);

  const supabase = createClient();

  const {
    notifications,
    getNotifications,
    updateInvitationList,
    subscriptionAddNotification,
  } = useNotificationsStore();

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      setIsLoading(true);
      await getNotifications();
      setIsLoading(false);
    };
    fetchInitialNotifications();
  }, [getNotifications]);

  useEffect(() => {
    const TABLE_NAME = "list_invitations";
    const channel = supabase
      .channel("list-invitations", { config: { broadcast: { self: false } } })
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: TABLE_NAME,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const invitation = payload.new as InvitationRow;
            toast(
              `${invitation.inviter_display_name} te ha invitado a la lista "${invitation.list_name}"`
            );
            subscriptionAddNotification(invitation);
          }

          // if (payload.eventType === "UPDATE") {
          //   const updatedMembership = payload.new as MembershipRow;
          //   subscriptionUpdateMembership(updatedMembership);
          // }

          // if (payload.eventType === "DELETE") {
          //   const oldMembership = payload.old as MembershipRow;

          //   if (oldMembership) {
          //     subscriptionDeleteList(oldMembership);
          //   }
          // }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, subscriptionAddNotification]);

  const handleToggle = () => {
    setActive(!active);
  };

  const handleClose = () => {
    setActive(false);
  };

  const handleAccept = async (invitationId: string) => {
    await updateInvitationList(invitationId, "accepted");

    // handleClose();
  };

  const handleDecline = async (invitationId: string) => {
    await updateInvitationList(invitationId, "rejected");
    // handleClose();
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
        {notifications.map((inv, index) => (
          <>
            <li key={inv.invitation_id} className={styles.notificationItem}>
              <div className={styles.notificationInfo}>
                <div
                  className={styles.configUserIcon}
                  style={{
                    backgroundImage: inv.inviter_avatar_url
                      ? `url('${inv.inviter_avatar_url}')`
                      : "",
                    opacity: inv.inviter_avatar_url ? 1 : 0.3,
                  }}
                >
                  {!inv.inviter_avatar_url && (
                    <UserIcon
                      style={{
                        stroke: "var(--icon-colorv2)",
                        strokeWidth: "1.5",
                        width: "60%",
                        height: "60%",
                      }}
                    />
                  )}
                </div>
                <span>
                  {inv.inviter_display_name || "Un usuario"} te ha invitado a la
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
            {notifications.length > index + 1 && (
              <div className={styles.separator}></div>
            )}
          </>
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
          style={{ width: "20px", height: "20px", stroke: "var(--icon-color)" }}
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
