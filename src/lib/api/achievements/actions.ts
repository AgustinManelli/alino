"use server";

import { cache } from "react";
import { createClient } from "@/utils/supabase/server";
import {
  AchievementsOverview,
  ClaimRewardResult,
} from "@/lib/schemas/database.types";

const getAuth = cache(async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("No autenticado.");
  return { supabase, user: data.user };
});

export async function getUserAchievementsAction(): Promise<{
  data?: AchievementsOverview;
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase.rpc(
      "get_user_achievements_overview",
      { p_user_id: user.id }
    );
    if (error) throw new Error(error.message);
    return { data: data as unknown as AchievementsOverview };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Error al obtener los logros del usuario.",
    };
  }
}

export async function claimAchievementRewardAction(
  achievementId: string
): Promise<ClaimRewardResult> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("claim_achievement_reward", {
      p_achievement_id: achievementId,
    });
    if (error) throw new Error(error.message);
    return data as unknown as ClaimRewardResult;
  } catch (e) {
    return {
      success: false,
      coins_reward: 0,
      xp_reward: 0,
      new_coins: 0,
      new_xp: 0,
      old_level: 1,
      new_level: 1,
      leveled_up: false,
      unlocked_cosmetics: [],
      error:
        e instanceof Error
          ? e.message
          : "Error al reclamar la recompensa del logro.",
    };
  }
}

export async function syncUserAchievementsAction(): Promise<{
  unlocked?: Array<{
    id: string;
    code: string;
    title: string;
    description: string;
    reward_coins: number;
    reward_xp: number;
  }>;
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase.rpc("sync_user_achievements", {
      p_user_id: user.id,
    });
    if (error) throw new Error(error.message);
    return {
      unlocked:
        (data as Array<{
          id: string;
          code: string;
          title: string;
          description: string;
          reward_coins: number;
          reward_xp: number;
        }>) || [],
    };
  } catch (e) {
    return {
      error:
        e instanceof Error
          ? e.message
          : "Error al sincronizar logros del usuario.",
    };
  }
}
