"use server";
import { cache } from "react";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import { SearchTermSchema, SearchUserSchema } from "@/lib/schemas/user/validation";

const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed";
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

interface AuthClient {
  supabase: SupabaseClient;
  user: User;
}

const extractStoragePath = (url: string, bucket: string): string | null => {
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(url.slice(idx + marker.length));
  } catch {
    return null;
  }
};

const getAuthenticatedSupabaseClient = async (): Promise<AuthClient> => {
  const supabase = createClientServer();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getUser();
  if (sessionError || !sessionData.user) {
    throw new Error(AUTH_ERROR_MESSAGE);
  }
  return { supabase, user: sessionData.user };
};

export const getUser = cache(async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`*, user_private (*)`)
      .eq("user_id", user.id)
      .single();

    if (userError) throw new Error("No se pudo obtener el usuario.");

    const { data: tier, error: tierError } = await supabase.rpc("get_user_tier", {
      p_user_id: user.id,
    });
    if (tierError) console.error("Error obteniendo tier:", tierError);

    return {
      data: {
        user: { ...userData, tier: tier ?? "free" },
      },
    };
  } catch (error) {
    return { error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE };
  }
});

export const setUsernameFirstTime = async (username: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("set_username_first_time", {
      p_username: username,
    });
    if (error) throw new Error(`${error.message}`);
    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

interface SearchUsersResult {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}
interface SearchUsersResponse {
  data?: SearchUsersResult[];
  error?: string;
}

export const searchUsers = async (searchTerm: string): Promise<SearchUsersResponse> => {
  try {
    const validationResult = SearchTermSchema.safeParse(searchTerm);
    if (!validationResult.success) return { error: validationResult.error.errors[0].message };
    const validatedSearchTerm = validationResult.data;
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    if (!user?.id) return { error: "Usuario no autenticado." };
    const { data, error } = await supabase.rpc("search_users_input", {
      p_search_term: validatedSearchTerm,
      p_exclude_user: user.id,
    });
    if (error) {
      if (error.code === "PGRST116" || error.code === "42883")
        return { error: "La función de búsqueda no está disponible en este momento." };
      return { error: "No se pudo obtener los usuarios. Inténtalo nuevamente." };
    }
    const responseValidation = z.array(SearchUserSchema).safeParse(data);
    if (!responseValidation.success) return { error: "Se recibió una respuesta con formato inválido." };
    return { data: responseValidation.data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Ocurrió un error desconocido." };
  }
};

export const updateUserProfile = async (updates: {
  display_name?: string;
  username?: string;
  biography?: string;
  avatar_url?: string;
}): Promise<{ data?: { old_avatar_url?: string }; error?: string }> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("update_user_profile", {
      p_display_name: updates.display_name || null,
      p_username:     updates.username     || null,
      p_biography:    updates.biography    !== undefined ? updates.biography : null,
      p_avatar_url:   updates.avatar_url   || null
    });

    if (error) {
      if (error.message.includes("MAX_USERNAME_CHANGE_PER_MONTH"))
        return { error: "Alcanzaste el límite de cambios de usuario este mes." };
      return { error: error.message };
    }

    return { data: { old_avatar_url: (data as any)?.old_avatar_url || null } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Ocurrió un error desconocido." };
  }
};

export interface ProfileStats {
  changes_this_month:   number;
  last_username_change: string | null;
  max_changes_per_month: number;
  remaining_changes:    number;
}

export const getUserProfileStats = async (): Promise<{
  data?: ProfileStats;
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("get_user_profile_stats");
    if (error) return { error: error.message };
    return { data: data as ProfileStats };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Ocurrió un error desconocido." };
  }
};

export const uploadAvatarAction = async (formData: FormData): Promise<{
  data?: { avatar_url: string };
  error?: string;
}> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No se proporcionó ningún archivo.");

    const fileExt = file.name.split(".").pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { 
        upsert: true,
        contentType: file.type 
      });

    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    const newAvatarUrl = publicUrlData.publicUrl;

    const updateResponse = await updateUserProfile({ avatar_url: newAvatarUrl });

    if (updateResponse.error) {
      await supabase.storage.from("avatars").remove([filePath]);
      throw new Error(updateResponse.error);
    }

    const oldAvatarUrl = updateResponse.data?.old_avatar_url;
    if (oldAvatarUrl) {
      const oldPath = extractStoragePath(oldAvatarUrl, "avatars");
      if (oldPath && oldPath !== filePath) {
        supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    return { data: { avatar_url: newAvatarUrl } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error al procesar la imagen." };
  }
};