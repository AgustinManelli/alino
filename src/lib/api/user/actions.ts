"use server";

import { cache } from "react";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from 'zod';
import { SearchTermSchema, SearchUserSchema } from "@/lib/schemas/user/validation";

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


export const getUser = cache(async () => {
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
});

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
    // Sanitizar y validar el término de búsqueda
    const validationResult = SearchTermSchema.safeParse(searchTerm);
    if (!validationResult.success) {
        return { error: validationResult.error.errors[0].message };
    }
    const validatedSearchTerm = validationResult.data;


    const { supabase, user } = await getAuthenticatedSupabaseClient();

    // Validar que el usuario esté autenticado
    if (!user || !user.id) {
      return { error: 'Usuario no autenticado.' };
    }

    const { data, error } = await supabase.rpc("search_users_input", {
      p_search_term: validatedSearchTerm,
      p_exclude_user: user.id,
    });

    if (error) {
      console.error('Error en RPC search_users_input:', error);
      if (error.code === 'PGRST116' || error.code === '42883') {
        return { error: 'La función de búsqueda no está disponible en este momento.' };
      }
      return { error: "No se pudo obtener los usuarios. Inténtalo nuevamente." };
    }

    // Validar la respuesta del RPC con Zod
    const responseValidation = z.array(SearchUserSchema).safeParse(data);
    if (!responseValidation.success) {
      console.error('RPC returned invalid data format:', responseValidation.error);
      return { error: 'Se recibió una respuesta con formato inválido desde el servidor.' };
    }

    // Devolver los datos validados por Zod
    return { data: responseValidation.data };

  } catch (error: unknown) {
    console.error('Error inesperado en searchUsers:', error);

    if (error instanceof Error) {
      if (error.message.includes('fetch')) {
        return { error: 'Error de conexión. Verifica tu conexión a internet.' };
      }
      if (error.message.includes('auth') || error.message.includes('unauthorized')) {
        return { error: 'Sesión expirada. Por favor, inicia sesión nuevamente.' };
      }
      return { error: error.message };
    }
    
    return { error: "Ocurrió un error desconocido. Inténtalo nuevamente." };
  }
};
