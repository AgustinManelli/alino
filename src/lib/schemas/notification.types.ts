// lib/schemas/notification.types.ts

export type NotificationType = "list_invitation" | "app_update" | "system";

export type Notification = {
  notification_id: string;
  type: NotificationType | string;
  title: string | null;
  content: string | null;
  metadata: Record<string, any> & {
    invitation_id?: string;
    list_id?: string;
    list_name?: string;
    inviter_user_id?: string;
    inviter_display_name?: string;
    inviter_username?: string;
    inviter_avatar_url?: string;
    invitation_status?: "pending" | "accepted" | "rejected" | null;
  };
  is_global: boolean;
  created_at: string;
  read: boolean;
  deleted: boolean;
  read_at: string | null;
  deleted_at: string | null;
};

export type NotificationDisplay = {
  title: string;
  content: string;
};

export function getNotificationDisplay(
  notification: Notification
): NotificationDisplay {
  switch (notification.type) {
    case "list_invitation": {
      const inviterName =
        notification.metadata?.inviter_display_name ||
        notification.metadata?.inviter_username ||
        "Alguien";
      const listName =
        notification.metadata?.list_name || "una lista eliminada";
      return {
        title: "Invitación a lista",
        content: `${inviterName} te invitó a unirte a "${listName}"`,
      };
    }

    case "app_update":
      return {
        title: notification.title || "Nueva actualización",
        content: notification.content || "",
      };

    case "system":
      return {
        title: notification.title || "Notificación del sistema",
        content: notification.content || "",
      };

    default:
      return {
        title: notification.title || "Notificación",
        content: notification.content || "",
      };
  }
}