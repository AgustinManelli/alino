"use server";

import { createClient as createClientServer } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { SupabaseClient, User } from "@supabase/supabase-js";

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

// Helper para obtener cliente autenticado
const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed";

interface AuthClient {
  supabase: SupabaseClient;
  user: User;
}

const getAuthenticatedSupabaseClient = async (): Promise<AuthClient> => {
  const supabase = createClientServer();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getUser();

  if (sessionError || !sessionData.user) {
    throw new Error(AUTH_ERROR_MESSAGE);
  }
  return { supabase, user: sessionData.user };
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

export const updateInvitationList = async (invitationId: string, status: string) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { error } = await supabase
      .from("list_invitations")
      .update({ status })
      .eq("invitation_id", invitationId)
      .eq("invited_user_id", user.id);

    if (error) throw error;

    return { error: null };
  } catch (error) {
    console.error("Error updating invitation:", error);
    return { error: (error as Error).message };
  }
};