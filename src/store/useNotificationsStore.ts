import { create } from "zustand";
import {
  getMyNotifications,
  markNotificationRead,
  deleteNotification,
  updateInvitationList,
  Notification,
} from "@/lib/api/notification/actions";
import { toast } from "sonner";

type NotificationsStore = {
  notifications: Notification[];
  initialFetch: boolean;
  getNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  updateInvitation: (notificationId: string, invitationId: string, status: string) => Promise<void>;
  addNotification: (notification: Notification) => void;
};

function handleError(err: unknown) {
  toast.error((err as Error).message || "Error desconocido");
}

export const useNotificationsStore = create<NotificationsStore>()((set, get) => ({
  notifications: [],
  initialFetch: false,

  getNotifications: async () => {
    const { notifications, error } = await getMyNotifications();

    if (error) {
      handleError(error);
      return;
    }

    set(() => ({ notifications, initialFetch: true }));
  },

  markAsRead: async (notificationId: string) => {
    const original = get().notifications;
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.notification_id === notificationId ? { ...n, read: true } : n
      ),
    }));

    const { error } = await markNotificationRead(notificationId);

    if (error) {
      handleError(error);
      set({ notifications: original });
    }
  },

  deleteNotification: async (notificationId: string) => {
    const original = get().notifications;
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.notification_id !== notificationId
      ),
    }));

    const { error } = await deleteNotification(notificationId);

    if (error) {
      handleError(error);
      set({ notifications: original });
    }
  },

  updateInvitation: async (notificationId: string, invitationId: string, status: string) => {
    const original = get().notifications;
    set((state) => ({
      notifications: state.notifications.filter(
        (n) => n.notification_id !== notificationId
      ),
    }));

    const { error } = await updateInvitationList(invitationId, status);

    if (error) {
      handleError(error);
      set({ notifications: original });
      return;
    }

    await deleteNotification(notificationId);
  },

  addNotification: (notification: Notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
    }));
  },
}));