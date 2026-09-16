"use server";
import { cache } from "react";
import { revalidatePath } from "next/cache";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import sizeOf from "image-size";
import { z } from "zod";
import {
  SearchTermSchema,
  SearchUserSchema,
} from "@/lib/schemas/user/validation";
import { ProfileStats, FeatureUsage, ActiveSubscription } from "@/lib/schemas/user.types";
import { UserType } from "@/lib/schemas/database.types";

import { fileTypeFromBuffer } from "file-type";
import { blobatar } from "blobatar";

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

export const getUser = cache(async () => {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase.rpc("get_current_user_full");

    if (error || !data) {
      throw new Error("No se pudo obtener el usuario.");
    }

    return { data: { user: data as UserType } };
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
}): Promise<{
  data?: { old_avatar_url?: string; avatar_url?: string };
  error?: string;
}> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    let avatarToSave = updates.avatar_url;

    if (avatarToSave && avatarToSave.startsWith("blobatar:")) {
      const seed =
        avatarToSave.slice("blobatar:".length) ||
        user.user_metadata?.username ||
        "alino";

      try {
        const svgString = blobatar(seed);
        const filePath = `${user.id}/blobatar-${encodeURIComponent(seed)}.svg`;

        const { error: uploadErr } = await supabase.storage
          .from("avatars")
          .upload(filePath, svgString, {
            upsert: true,
            contentType: "image/svg+xml",
          });

        if (!uploadErr) {
          const { data: publicUrlData } = supabase.storage
            .from("avatars")
            .getPublicUrl(filePath);
          avatarToSave = publicUrlData.publicUrl;
        }
      } catch {
        avatarToSave = updates.avatar_url;
      }
    }

    const { data, error } = await supabase.rpc("update_user_profile", {
      p_display_name: updates.display_name || null,
      p_username: updates.username || null,
      p_biography: updates.biography !== undefined ? updates.biography : null,
      p_avatar_url: avatarToSave !== undefined ? avatarToSave : null,
    });
    if (error) {
      if (error.message.includes("MAX_USERNAME_CHANGE_PER_MONTH"))
        return {
          error: "Alcanzaste el límite de cambios de usuario este mes.",
        };
      return { error: error.message };
    }
    revalidatePath("/alino-app", "layout");
    const oldAvatar = (data as { old_avatar_url?: string } | null)?.old_avatar_url;

    if (oldAvatar && avatarToSave && oldAvatar !== avatarToSave) {
      const oldPath = extractStoragePath(oldAvatar, "avatars");
      const newPath = extractStoragePath(avatarToSave, "avatars");
      if (oldPath && oldPath !== newPath) {
        supabase.storage.from("avatars").remove([oldPath]);
      }
    }

    return {
      data: {
        old_avatar_url: oldAvatar || undefined,
        avatar_url: avatarToSave,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Ocurrió un error desconocido." };
  }
};

export const saveBlobatarAvatarAction = async (
  seed: string,
): Promise<{ data?: { avatar_url?: string }; error?: string }> => {
  return updateUserProfile({ avatar_url: `blobatar:${seed}` });
};



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

    const buffer = Buffer.from(await file.arrayBuffer());

    if (file.size > 100 * 1024) {
      throw new Error("La imagen supera el límite de 100KB.");
    }

    const detectedType = await fileTypeFromBuffer(buffer);

    if (
      !detectedType ||
      !["image/jpeg", "image/png", "image/webp"].includes(detectedType.mime)
    ) {
      throw new Error("El archivo no es una imagen válida.");
    }

    try {
      const dimensions = sizeOf(buffer);

      if (!dimensions.width || !dimensions.height) {
        throw new Error("No se pudo analizar la imagen.");
      }

      if (dimensions.width !== dimensions.height) {
        throw new Error("La imagen debe ser estrictamente cuadrada (1:1).");
      }

      if (dimensions.width > 128) {
        throw new Error("La resolución máxima es 128x128.");
      }
    } catch {
      throw new Error("Archivo de imagen inválido o corrupto.");
    }

    const fileExt = detectedType.ext;
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, {
        upsert: true,
        contentType: detectedType.mime,
      });

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
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "Error al cancelar la suscripción." };
  }
};

export const checkTrialEligibility = async (): Promise<{
  data?: { eligible: boolean; trial_days: number; offer_phase_days: number };
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("check_trial_eligibility");
    if (error) return { error: error.message };
    return { data: data as { eligible: boolean; trial_days: number; offer_phase_days: number } };
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
    return {
      data: data as {
        message: string;
        granted_tier: string;
        new_end_date: string;
        duration: number;
      },
    };
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
    return {
      data: data as {
        tier: string;
        status: string;
        current_period_end?: string;
      },
    };
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
  planId: string,
  payerEmail: string
): Promise<{
  data?: { url: string; subscriptionId?: string };
  error?: string;
}> => {
  try {
    const { user } = await getAuthenticatedSupabaseClient();

    if (gateway === "mercadopago") {
      const { createMPSubscription } = await import("./payments");
      const result = await createMPSubscription(user.id, planId, payerEmail);
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

export const updateUserPreferences = async (preferences: Record<string, unknown>) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    
    const { data: currentPrivate, error: readError } = await supabase
      .from("user_private")
      .select("preferences")
      .eq("user_id", user.id)
      .maybeSingle();

    if (readError) throw readError;

    const mergedPreferences = {
      ...((currentPrivate?.preferences as Record<string, unknown>) || {}),
      ...preferences,
    };

    const { error: updateError } = await supabase
      .from("user_private")
      .update({ 
        preferences: mergedPreferences, 
        updated_at: new Date().toISOString() 
      })
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    return { data: mergedPreferences };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export interface UserOnboardingSurveyData {
  goal: string | null;
  role: string | null;
  referral: string | null;
  referral_detail?: string | null;
  referral_code?: string | null;
}

export const saveUserOnboardingSurvey = async (
  surveyData: UserOnboardingSurveyData,
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("user_onboarding_surveys")
      .upsert(
        {
          user_id: user.id,
          goal: surveyData.goal,
          role: surveyData.role,
          referral: surveyData.referral,
          referral_detail: surveyData.referral_detail ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" },
      )
      .select()
      .single();

    if (error) throw error;

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export interface ApplyReferralCodeResult {
  success: boolean;
  referrer_code?: string;
  reward_days?: number;
  message?: string;
  error?: string;
}

export const applyReferralCodeAction = async (
  code: string,
): Promise<{ data?: ApplyReferralCodeResult; error?: string }> => {
  try {
    if (!code?.trim()) return { error: "El código no puede estar vacío." };
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("apply_referral_code", {
      p_code: code.trim().toUpperCase(),
    });

    if (error) return { error: error.message };

    const parsed = data as {
      success: boolean;
      error?: string;
      message?: string;
      referrer_code?: string;
      reward_days?: number;
    };

    if (!parsed.success) {
      return { error: parsed.error || "No se pudo aplicar el código de referido." };
    }

    revalidatePath("/alino-app", "layout");
    return { data: parsed };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export interface ReferredUserSummary {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

export interface UserReferralStats {
  referral_code: string;
  total_referrals: number;
  claimed_milestones: number;
  current_progress: number;
  milestone_target: number;
  milestone_reward_days: number;
  reward_days_referred: number;
  total_days_earned: number;
  can_claim: boolean;
  has_been_referred: boolean;
  recent_referrals: ReferredUserSummary[];
}

export const getUserReferralStatsAction = async (): Promise<{
  data?: UserReferralStats;
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("get_user_referral_stats");

    if (error) return { error: error.message };

    const parsed = data as {
      success: boolean;
      error?: string;
      referral_code: string;
      total_referrals: number;
      claimed_milestones: number;
      current_progress: number;
      milestone_target: number;
      milestone_reward_days: number;
      reward_days_referred: number;
      total_days_earned: number;
      can_claim: boolean;
      has_been_referred: boolean;
      recent_referrals: ReferredUserSummary[];
    };

    if (!parsed.success) {
      return { error: parsed.error || "Error al obtener estadísticas de referidos." };
    }

    return {
      data: {
        referral_code: parsed.referral_code,
        total_referrals: parsed.total_referrals,
        claimed_milestones: parsed.claimed_milestones,
        current_progress: parsed.current_progress,
        milestone_target: parsed.milestone_target,
        milestone_reward_days: parsed.milestone_reward_days,
        reward_days_referred: parsed.reward_days_referred,
        total_days_earned: parsed.total_days_earned,
        can_claim: parsed.can_claim,
        has_been_referred: parsed.has_been_referred,
        recent_referrals: parsed.recent_referrals || [],
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export interface ClaimMilestoneResult {
  success: boolean;
  reward_days?: number;
  claimed_milestones?: number;
  message?: string;
  error?: string;
}

export const claimReferralMilestoneAction = async (): Promise<{
  data?: ClaimMilestoneResult;
  error?: string;
}> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase.rpc("claim_referral_milestone_reward");

    if (error) return { error: error.message };

    const parsed = data as {
      success: boolean;
      error?: string;
      message?: string;
      reward_days?: number;
      claimed_milestones?: number;
    };

    if (!parsed.success) {
      return { error: parsed.error || "No se pudo reclamar la recompensa de referidos." };
    }

    revalidatePath("/alino-app", "layout");
    return { data: parsed };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateUserSecuritySettingsAction = async (settings: {
  is_private?: boolean;
  allow_list_invites?: boolean;
  show_activity_status?: boolean;
}): Promise<{ error: string | null }> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    if (!user?.id) return { error: "Usuario no autenticado." };

    const { error } = await supabase
      .from("users")
      .update(settings as Record<string, unknown>)
      .eq("user_id", user.id);

    if (error) {
      // Fallback a guardar en preferencias de user_private si las columnas aún no existen en users
      const { data: priv } = await supabase
        .from("user_private")
        .select("preferences")
        .eq("user_id", user.id)
        .single();

      const existingPrefs = (priv?.preferences as Record<string, unknown>) || {};
      await supabase
        .from("user_private")
        .update({ preferences: { ...existingPrefs, ...settings } })
        .eq("user_id", user.id);
    }

    return { error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { error: msg };
  }
};

export const exportUserDataAction = async (): Promise<{
  data?: Record<string, unknown>;
  error?: string;
}> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    if (!user?.id) return { error: "Usuario no autenticado." };

    const [userData, listsData, tasksData, widgetsData] = await Promise.all([
      supabase.from("users").select("*").eq("user_id", user.id).single(),
      supabase.from("lists").select("*").eq("user_id", user.id),
      supabase.from("tasks").select("*").eq("user_id", user.id),
      supabase.from("user_widgets").select("*").eq("user_id", user.id),
    ]);

    const backupData = {
      export_version: "1.0",
      app: "Alino",
      exported_at: new Date().toISOString(),
      user: userData.data || null,
      lists: listsData.data || [],
      tasks: tasksData.data || [],
      widgets: widgetsData.data || [],
    };

    return { data: backupData };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { error: msg };
  }
};

export const deleteAccountAction = async (
  confirmationUsername: string
): Promise<{ error: string | null }> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();
    if (!user?.id) return { error: "Usuario no autenticado." };

    const { data: dbUser } = await supabase
      .from("users")
      .select("username")
      .eq("user_id", user.id)
      .single();

    if (
      !dbUser ||
      dbUser.username.trim().toLowerCase() !==
        confirmationUsername.trim().toLowerCase()
    ) {
      return { error: "El nombre de usuario ingresado no coincide." };
    }

    // 1. Eliminar datos en la base de datos pública (cascada a tareas, listas, etc.)
    const { error: dbError } = await supabase
      .from("users")
      .delete()
      .eq("user_id", user.id);

    if (dbError) {
      return {
        error: `No se pudo eliminar la información de la cuenta: ${dbError.message}`,
      };
    }

    // 2. Si existe la clave de servicio, eliminar el usuario de auth.users
    if (
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NEXT_PUBLIC_SUPABASE_URL
    ) {
      try {
        const { createClient: createAdminClient } = await import(
          "@supabase/supabase-js"
        );
        const admin = createAdminClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL,
          process.env.SUPABASE_SERVICE_ROLE_KEY
        );
        await admin.auth.admin.deleteUser(user.id);
      } catch {}
    }

    return { error: null };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : UNKNOWN_ERROR_MESSAGE;
    return { error: msg };
  }
};


