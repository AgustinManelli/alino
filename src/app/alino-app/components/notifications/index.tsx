"use client";

import { useState, useRef, useEffect } from "react";
import React from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

import { useNotificationsStore } from "@/store/useNotificationsStore";
import { InvitationRow } from "@/lib/schemas/todo-schema";

import { ModalBox } from "@/components/ui/modal-options-box/modalBox";

import { Alert, LoadingIcon, UserIcon } from "@/components/ui/icons/icons";
import styles from "./NotificationsSection.module.css";

export const NotificationsSection = () => {
  const [isOpen, setIsOpen] = useState(false);
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
          // const oldMembership = payload.old as MembershipRow;

          // if (oldMembership) {
          //   subscriptionDeleteList(oldMembership);
          // }
          // }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, subscriptionAddNotification]);

  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleAccept = async (invitationId: string) => {
    await updateInvitationList(invitationId, "accepted");
  };

  const handleDecline = async (invitationId: string) => {
    await updateInvitationList(invitationId, "rejected");
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
        {notifications.map((inv, index) => (
          <React.Fragment key={inv.invitation_id}>
            <li className={styles.notificationItem}>
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
          </React.Fragment>
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
        {notifications && notifications.length > 0 && (
          <span className={styles.badge}>{notifications.length}</span>
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
    </div>
  );
};
