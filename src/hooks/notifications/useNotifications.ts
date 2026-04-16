"use client"

import { useCallback } from "react";
import {
  getMyNotifications,
  markNotificationRead,
  deleteNotification as deleteNotificationAction,
  updateInvitationList,
} from "@/lib/api/notification/actions";
import { useNotificationsStore } from "@/store/useNotificationsStore";
import { toast } from "sonner";

export function useNotifications() {
  const setNotifications = useNotificationsStore((s) => s.setNotifications);
  const markReadInStore = useNotificationsStore((s) => s.markReadInStore);
  const removeNotificationFromStore = useNotificationsStore((s) => s.removeNotificationFromStore);
  const notifications = useNotificationsStore((s) => s.notifications);

  const fetchNotifications = useCallback(async () => {
    const { notifications, error } = await getMyNotifications();
    if (error) {
      toast.error(error || "Error al obtener notificaciones");
      return;
    }
    setNotifications(notifications);
  }, [setNotifications]);

  const markAsRead = useCallback(async (notificationId: string) => {
    const original = [...useNotificationsStore.getState().notifications];
    markReadInStore(notificationId);

    const { error } = await markNotificationRead(notificationId);
    if (error) {
      toast.error(error || "Error al marcar como leída");
      setNotifications(original);
    }
  }, [markReadInStore, setNotifications]);

  const deleteNotification = useCallback(async (notificationId: string) => {
    const original = [...useNotificationsStore.getState().notifications];
    removeNotificationFromStore(notificationId);

    const { error } = await deleteNotificationAction(notificationId);
    if (error) {
      toast.error(error || "Error al eliminar notificación");
      setNotifications(original);
    }
  }, [removeNotificationFromStore, setNotifications]);

  const updateInvitation = useCallback(async (notificationId: string, invitationId: string, status: string) => {
    const original = [...useNotificationsStore.getState().notifications];
    removeNotificationFromStore(notificationId);

    const { error } = await updateInvitationList(invitationId, status);
    if (error) {
      toast.error(error || "Error al actualizar invitación");
      setNotifications(original);
      return;
    }

    await deleteNotificationAction(notificationId);
  }, [removeNotificationFromStore, setNotifications]);

  return {
    notifications,
    fetchNotifications,
    markAsRead,
    deleteNotification,
    updateInvitation,
  };
}
