"use client";

import { create } from "zustand";
import { Notification } from "@/lib/schemas/notification.types";

type NotificationsStore = {
  notifications: Notification[];
  initialFetch: boolean;
  setNotifications: (notifications: Notification[]) => void;
  markReadInStore: (notificationId: string) => void;
  removeNotificationFromStore: (notificationId: string) => void;
  addNotificationToStore: (notification: Notification) => void;
};

export const useNotificationsStore = create<NotificationsStore>()((set) => ({
  notifications: [],
  initialFetch: false,

  setNotifications: (notifications) => set({ notifications, initialFetch: true }),

  markReadInStore: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, read: true } : n
      ),
    })),

  removeNotificationFromStore: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.notification_id !== notificationId
      ),
    })),

  addNotificationToStore: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
    })),
}));