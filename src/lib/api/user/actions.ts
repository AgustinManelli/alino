"use server";
import { cache } from "react";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  SearchTermSchema,
  SearchUserSchema,
} from "@/lib/schemas/user/validation";

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
  if (sessionError || !sessionData.user) throw new Error(AUTH_ERROR_MESSAGE);
  return { supabase, user: sessionData.user };
};

// ─── USER ──────────────────────────────────────────────────

export const getUser = cache(async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const [userResult, tierResult] = await Promise.all([
      supabase
        .from("users")
        .select(`*, user_private (*)`)
        .eq("user_id", user.id)
        .single(),
      supabase.rpc("get_user_tier", { p_user_id: user.id }),
    ]);

    if (userResult.error) throw new Error("No se pudo obtener el usuario.");
    if (tierResult.error)
      console.error("Error obteniendo tier:", tierResult.error);

    return {
      data: {
        user: { ...userResult.data, tier: tierResult.data ?? "free" },
      },
    };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE,
    };
  }
});

export const setUsernameFirstTime = async (username: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("set_username_first_time", {
      p_username: username,
    });
    if (error) throw new Error(error.message);
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

export const searchUsers = async (
  searchTerm: string,
): Promise<SearchUsersResponse> => {
  try {
    const validationResult = SearchTermSchema.safeParse(searchTerm);
    if (!validationResult.success)
      return { error: validationResult.error.errors[0].message };

    const { supabase, user } = await getAuthenticatedSupabaseClient();
    if (!user?.id) return { error: "Usuario no autenticado." };

    const { data, error } = await supabase.rpc("search_users_input", {
      p_search_term: validationResult.data,
      p_exclude_user: user.id,
    });
    if (error) return { error: "No se pudo obtener los usuarios." };

    const responseValidation = z.array(SearchUserSchema).safeParse(data);
    if (!responseValidation.success)
      return { error: "Respuesta con formato inválido." };
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
      p_username: updates.username || null,
      p_biography: updates.biography !== undefined ? updates.biography : null,
      p_avatar_url: updates.avatar_url || null,
    });
    if (error) {
      if (error.message.includes("MAX_USERNAME_CHANGE_PER_MONTH"))
        return {
          error: "Alcanzaste el límite de cambios de usuario este mes.",
        };
      return { error: error.message };
    }
    return { data: { old_avatar_url: (data as any)?.old_avatar_url || null } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Ocurrió un error desconocido." };
  }
};

export interface ProfileStats {
  changes_this_month: number;
  last_username_change: string | null;
  max_changes_per_month: number;
  remaining_changes: number;
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

export const uploadAvatarAction = async (
  formData: FormData,
): Promise<{
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
      .upload(filePath, file, { upsert: true, contentType: file.type });
    if (uploadError) throw uploadError;

    const { data: publicUrlData } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);
    const newAvatarUrl = publicUrlData.publicUrl;

    const updateResponse = await updateUserProfile({
      avatar_url: newAvatarUrl,
    });
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

export type SubscriptionTier = "free" | "student" | "pro";

export interface ActiveSubscription {
  id?: string;
  tier: SubscriptionTier;
  status:
    | "free"
    | "active"
    | "trialing"
    | "canceled"
    | "past_due"
    | "incomplete";
  gateway?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export const getActiveSubscription = async (): Promise<{
  data?: ActiveSubscription;
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("get_active_subscription");
    if (error) return { error: error.message };
    return { data: data as ActiveSubscription };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error desconocido." };
  }
};

export const cancelSubscriptionAction = async (): Promise<{
  data?: string;
  error?: string;
}> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    
    const { data: sub, error } = await supabase
      .from('subscriptions')
      .select('id, subscription_id, gateway, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .order('current_period_end', { ascending: false })
      .limit(1)
      .single();

    if (error || !sub) return { error: "No tienes una suscripción activa para cancelar." };

    if (sub.gateway === "mercadopago" && sub.subscription_id) {
      const { cancelMPSubscription } = await import("./payments");
      await cancelMPSubscription(sub.subscription_id);
      
      await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true, status: 'canceled' })
        .eq('id', sub.id);
        
      return { data: "Suscripción cancelada con éxito." };
    } else if (sub.gateway === "promo" || sub.gateway === "manual") {
      await supabase
        .from('subscriptions')
        .update({ cancel_at_period_end: true, status: 'canceled' })
        .eq('id', sub.id);
        
      return { data: "Suscripción cancelada con éxito." };
    }
    
    return { error: "No se puede cancelar esta suscripción." };
  } catch (error: any) {
    return { error: error.message || "Error al cancelar la suscripción." };
  }
};

export const checkTrialEligibility = async (): Promise<{
  data?: { eligible: boolean; trial_days: number };
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("check_trial_eligibility");
    if (error) return { error: error.message };
    return { data: data as { eligible: boolean; trial_days: number } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error desconocido." };
  }
};

export const redeemPromoCodeAction = async (
  code: string,
): Promise<{
  data?: {
    message: string;
    granted_tier: string;
    new_end_date: string;
    duration: number;
  };
  error?: string;
}> => {
  try {
    if (!code?.trim()) return { error: "El código no puede estar vacío." };
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("redeem_promo_code", {
      p_code: code.trim().toUpperCase(),
    });
    if (error) return { error: error.message };
    return { data: data as any };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error al canjear el código." };
  }
};

export const getSubscriptionByExternalId = async (
  subscriptionId: string,
  gateway: "stripe" | "mercadopago"
): Promise<{
  data?: { tier: string; status: string; current_period_end?: string };
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc(
      "get_subscription_by_external_id",
      {
        p_subscription_id: subscriptionId,
        p_gateway: gateway,
      }
    );
    if (error) return { error: error.message };
    return { data: data as any };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error desconocido." };
  }
};

export const getAvailablePlansAction = async () => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true });

    if (error) return { error: error.message };
    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error desconocido." };
  }
};

export const createCheckoutSessionAction = async (
  gateway: "stripe" | "mercadopago",
  planId: string
): Promise<{
  data?: { url: string; subscriptionId?: string };
  error?: string;
}> => {
  try {
    const { user } = await getAuthenticatedSupabaseClient();

    if (!user.email) {
      return {
        error: "Tu cuenta no tiene email asociado. Contacta soporte.",
      };
    }

    if (gateway === "mercadopago") {
      const { createMPSubscription } = await import("./payments");
      const result = await createMPSubscription(user.id, user.email, planId);
      return {
        data: { url: result.url, subscriptionId: result.subscriptionId },
      };
    }

    return { error: "Gateway no soportado." };
  } catch (error: unknown) {
    console.error("[checkout action] Error:", error);
    if (error instanceof Error) return { error: error.message };
    return { error: "Error desconocido al procesar el pago." };
  }
};

export interface FeatureUsage {
  used: number;
  limit: number;
  remaining: number;
  period_end: string;
  tier: string;
}

export const getFeatureUsageAction = async (
  featureKey: string,
): Promise<{ data?: FeatureUsage; error?: string }> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("get_feature_usage", {
      p_feature_key: featureKey,
    });
    if (error) return { error: error.message };
    return { data: data as FeatureUsage };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error desconocido." };
  }
};
