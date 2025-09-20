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
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    throw new Error(AUTH_ERROR_MESSAGE);
  } else {
    return { supabase, user: sessionData.session.user };
  }
};

export async function getUser() {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`*, user_private (*)`)
      .eq("user_id", user.id)
      .single();

    if (userError) {
      throw new Error(
        "No se pudo obtener el usuario. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: { user: userData } };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}

export const setUsernameFirstTime = async (username: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("set_username_first_time", {
      p_username: username,
    });

    if (error) {
      throw new Error(`${error.message}`);
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("search_users_input", {
      p_search_term: searchTerm,
      p_exclude_user: user.id,
    });

    if (error) {
      throw new Error(
        "No se pudo obtener los usuarios. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};
