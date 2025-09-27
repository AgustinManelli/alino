"use server";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed";
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

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
  } else {
    return { supabase, user: sessionData.user };
  }
};

export const getNotifications = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    if (!user) {
      return { data: { notifications: [] } };
    }

    const { data, error } = await supabase
      .from("list_invitations")
      .select("*")
      .eq("invited_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `No se pudieron obtener las notificaciones: ${error.message}`
      );
    }

    if (!data) {
      return { data: { notifications: [] } };
    }

    return { data: { notifications: data } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

export const updateInvitationList = async (
  notification_id: string,
  status: string
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    if (!user) {
      return { data: { notifications: [] } };
    }

    const { data, error } = await supabase
      .from("list_invitations")
      .update({ status: status })
      .eq("invited_user_id", user.id)
      .eq("invitation_id", notification_id);

    if (error) {
      throw new Error(`No se pudo aceptar la invitación: ${error.message}`);
    }

    if (!data) {
      return { data: { notifications: [] } };
    }

    return { data: { notifications: data } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};
