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

export async function getAppUpdates() {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: updatesData, error: updatesError } = await supabase
      .from("app_updates")
      .select("*")
      .eq("is_published", true)
      .gte("published_at", oneMonthAgo.toISOString())
      .order("published_at", { ascending: false })
      .limit(3);

    if (updatesError) {
      throw new Error(
        "No se pudieron obtener las actualizaciones. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: updatesData };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}