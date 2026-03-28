"use server";

import { createClient as createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// Tipos para notificaciones
export type Notification = {
  notification_id: string;
  type: string;
  title: string;
  content: string;
  metadata: any;
  is_global: boolean;
  created_at: string;
  read: boolean;
  deleted: boolean;
  read_at: string | null;
  deleted_at: string | null;
};

// Obtener notificaciones del usuario actual
export async function getMyNotifications() {
  const supabase = createClientServer();

  const { data, error } = await supabase.rpc("get_my_notifications");

  if (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [] as Notification[], error };
  }

  return { notifications: data as Notification[], error: null };
}

// Marcar notificación como leída
export async function markNotificationRead(notificationId: string) {
  const supabase = createClientServer();

  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: notificationId,
  });

  if (error) {
    console.error("Error marking notification read:", error);
    return { error };
  }

  revalidatePath("/");
  return { error: null };
}

// Eliminar notificación (soft delete)
export async function deleteNotification(notificationId: string) {
  const supabase = createClientServer();

  const { error } = await supabase.rpc("delete_notification", {
    p_notification_id: notificationId,
  });

  if (error) {
    console.error("Error deleting notification:", error);
    return { error };
  }

  revalidatePath("/");
  return { error: null };
}