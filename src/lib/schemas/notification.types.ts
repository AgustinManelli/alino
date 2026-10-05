import { buildListInvitationMessage, stripEmojis } from "@/lib/notifications/messageBuilders";
import type { SupportedLanguage } from "@/lib/i18n/types";

export type NotificationType =
  | "list_invitation"
  | "app_update"
  | "system";

export type Notification = {
  notification_id: string;
  type: NotificationType | string;
  title: string | null;
  content: string | null;
  metadata: {
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
    image_url?: string;
    category?: string;
    version?: string;
    [key: string]: string | number | boolean | null | undefined;
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
  notification: Notification,
  lang: SupportedLanguage = "es"
): NotificationDisplay {
  switch (notification.type) {
    case "list_invitation": {
      const inviterName =
        (notification.metadata?.inviter_display_name as string | undefined) ||
        (notification.metadata?.inviter_username as string | undefined) ||
        null;
      const listName = (notification.metadata?.list_name as string | undefined) || null;
      const built = buildListInvitationMessage({ inviterName, listName, lang });
      return {
        title: built.title,
        content: built.body,
      };
    }

    case "app_update":
      return {
        title: stripEmojis(notification.title || (lang === "en" ? "New update" : "Nueva actualización")),
        content: stripEmojis(notification.content || ""),
      };

    case "daily_digest":
      return {
        title: stripEmojis(notification.title || (lang === "en" ? "Daily digest" : "Resumen diario")),
        content: stripEmojis(notification.content || (lang === "en" ? "Check your daily tasks." : "Revisa tus tareas del día.")),
      };

    case "task_due":
      return {
        title: stripEmojis(notification.title || (lang === "en" ? "Upcoming task due" : "Tarea por vencer")),
        content: stripEmojis(notification.content || (lang === "en" ? "You have a task due soon." : "Tienes una tarea próxima a vencer.")),
      };

    case "streak_danger":
      return {
        title: stripEmojis(notification.title || (lang === "en" ? "Streak at risk" : "Racha en riesgo")),
        content: stripEmojis(notification.content || (lang === "en" ? "Complete a task to keep your streak alive." : "Completa una tarea para mantener tu racha activa.")),
      };

    case "engagement_nudge":
      return {
        title: stripEmojis(notification.title || "Alino"),
        content: stripEmojis(notification.content || (lang === "en" ? "Updates and goals in your account." : "Novedades y objetivos en tu cuenta.")),
      };

    case "system":
      return {
        title: stripEmojis(notification.title || (lang === "en" ? "System notification" : "Notificación del sistema")),
        content: stripEmojis(notification.content || ""),
      };

    default:
      return {
        title: stripEmojis(notification.title || (lang === "en" ? "Notification" : "Notificación")),
        content: stripEmojis(notification.content || ""),
      };
  }
}