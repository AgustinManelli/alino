// lib/schemas/notification.types.ts

export type NotificationType =
  | "list_invitation"
  | "app_update"
  | "system"
  | "daily_digest"
  | "task_due"
  | "streak_danger"
  | "engagement_nudge";

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
    task_id?: string;
    target_date?: string;
    streak?: number;
    date?: string;
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

    case "daily_digest":
      return {
        title: notification.title || "☀️ Resumen de productividad",
        content: notification.content || "Revisa tus tareas del día.",
      };

    case "task_due":
      return {
        title: notification.title || "⏰ Tarea por vencer",
        content: notification.content || "Tienes una tarea próxima a su hora límite.",
      };

    case "streak_danger":
      return {
        title: notification.title || "🔥 ¡Racha en peligro!",
        content: notification.content || "Completa una tarea para mantener tu racha viva.",
      };

    case "engagement_nudge":
      return {
        title: notification.title || "✨ Notificación de Alino",
        content: notification.content || "Novedades y objetivos en tu cuenta.",
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