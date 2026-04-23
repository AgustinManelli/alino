"use server";

import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { Notification } from "@/lib/schemas/notification.types";

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

export async function getMyNotifications() {
  const supabase = createClientServer();
  const { data, error } = await supabase.rpc("get_my_notifications");

  if (error) {
    console.error("Error fetching notifications:", error);
    return { notifications: [] as Notification[], error: error.message };
  }

  return { notifications: data as Notification[], error: null };
}

export async function markNotificationRead(notificationId: string) {
  const supabase = createClientServer();
  const { error } = await supabase.rpc("mark_notification_read", {
    p_notification_id: notificationId,
  });

  if (error) {
    console.error("Error marking notification read:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function markAllNotificationsRead() {
  const supabase = createClientServer();
  const { error } = await supabase.rpc("mark_all_notifications_read");

  if (error) {
    console.error("Error marking all notifications read:", error);
    return { error: error.message };
  }

  return { error: null };
}

export async function deleteNotification(notificationId: string) {
  const supabase = createClientServer();
  const { error } = await supabase.rpc("delete_notification", {
    p_notification_id: notificationId,
  });

  if (error) {
    console.error("Error deleting notification:", error);
    return { error: error.message };
  }

  return { error: null };
}

export const updateInvitationList = async (
  invitationId: string,
  status: string
) => {
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