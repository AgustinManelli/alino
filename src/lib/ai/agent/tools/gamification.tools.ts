import { z } from "zod";
import { AgentToolDefinition } from "../types";
import { getUserAchievementsAction } from "@/lib/api/achievements/actions";
import { getActiveSubscription, getFeatureUsageAction } from "@/lib/api/user/actions";

export const getUserAccountOverviewTool: AgentToolDefinition = {
  name: "get_user_account_overview",
  description:
    "Queries user profile (username, display name), coins (Alino Coins), current level, experience points (XP), progress to next level, active subscription tier and expiration date, remaining free and purchased AI credits, and daily streak status.",
  parameters: z.object({}),
  execute: async (_, context) => {
    const [coinsRes, privRes, userRes, subRes, aiCreditsRes, streakRes] = await Promise.all([
      context.supabase.rpc("get_user_coins", { p_user_id: context.userId }),
      context.supabase
        .from("user_private")
        .select("alino_coins, xp, extra_ai_credits")
        .eq("user_id", context.userId)
        .maybeSingle(),
      context.supabase
        .from("users")
        .select("level, display_name, username")
        .eq("user_id", context.userId)
        .maybeSingle(),
      getActiveSubscription(),
      getFeatureUsageAction("ai_credits"),
      context.supabase
        .from("user_streaks")
        .select("current_streak, longest_streak, last_completion_date")
        .eq("user_id", context.userId)
        .maybeSingle(),
    ]);

    const coins = (typeof coinsRes.data === "number") ? coinsRes.data : (privRes.data?.alino_coins ?? 0);
    const xp = privRes.data?.xp ?? 0;
    const level = userRes.data?.level ?? 1;

    let nextLevelXp = 0;
    let xpToNextLevel = 0;
    let levelProgressPercentage = 0;

    const { data: levelsData } = await context.supabase.rpc("get_levels_roadmap");
    if (Array.isArray(levelsData)) {
      const currentLevelInfo = levelsData.find((l: any) => l.level === level);
      const nextLevelInfo = levelsData.find((l: any) => l.level === level + 1);

      if (currentLevelInfo && nextLevelInfo) {
        const minXp = currentLevelInfo.min_xp ?? 0;
        const maxXp = currentLevelInfo.max_xp ?? nextLevelInfo.min_xp ?? 1000;
        nextLevelXp = maxXp;
        xpToNextLevel = Math.max(0, maxXp - xp);
        levelProgressPercentage = Math.min(
          100,
          Math.max(0, Math.round(((xp - minXp) / Math.max(1, maxXp - minXp)) * 100))
        );
      }
    }

    const sub = subRes.data;
    const membership = {
      tier: sub?.tier ?? "free",
      status: sub?.status ?? "active",
      period_end: sub?.current_period_end ?? null,
      days_left: sub?.current_period_end
        ? Math.max(
          0,
          Math.ceil(
            (new Date(sub.current_period_end).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
          )
        )
        : null,
      is_trialing: sub?.status === "trialing",
    };

    const aiUsage = aiCreditsRes.data;
    const aiCredits = {
      plan_monthly_limit: aiUsage?.limit ?? 0,
      plan_used_this_period: aiUsage?.used ?? 0,
      plan_remaining: aiUsage?.remaining ?? 0,
      extra_purchased_remaining: aiUsage?.extra_remaining ?? (privRes.data?.extra_ai_credits ?? 0),
      total_available: (aiUsage?.remaining ?? 0) + (aiUsage?.extra_remaining ?? (privRes.data?.extra_ai_credits ?? 0)),
      period_end: aiUsage?.period_end ?? null,
    };

    const streak = {
      current_streak: streakRes.data?.current_streak ?? 0,
      longest_streak: streakRes.data?.longest_streak ?? 0,
      last_completion_date: streakRes.data?.last_completion_date ?? null,
    };

    return {
      user: {
        username: userRes.data?.username,
        display_name: userRes.data?.display_name,
      },
      coins,
      level_progression: {
        current_level: level,
        current_xp: xp,
        xp_needed_for_next_level: xpToNextLevel,
        next_level_total_xp: nextLevelXp,
        progress_percentage: levelProgressPercentage,
      },
      membership,
      ai_credits: aiCredits,
      streak,
    };
  },
};

export const getAchievementsAndRewardsTool: AgentToolDefinition = {
  name: "get_achievements_and_rewards",
  description:
    "Queries user achievements, completion percentage, unclaimed rewards, and the next closest achievement to complete.",
  parameters: z.object({}),
  execute: async () => {
    const res = await getUserAchievementsAction();
    if (res.error) {
      return { error: res.error };
    }

    const data = res.data;
    if (!data) {
      return { message: "No achievement data found." };
    }

    const allAchievements = data.achievements || [];
    const unclaimed = allAchievements.filter(
      (a: any) => a.is_completed && !a.is_claimed
    );
    const inProgress = allAchievements.filter((a: any) => !a.is_completed);

    let nextClosest = null;
    if (inProgress.length > 0) {
      nextClosest = inProgress.reduce((prev: any, curr: any) => {
        const prevRatio = (prev.current_progress || 0) / (prev.target_value || 1);
        const currRatio = (curr.current_progress || 0) / (curr.target_value || 1);
        return currRatio > prevRatio ? curr : prev;
      }, inProgress[0]);
    }

    return {
      total_achievements: data.total_count,
      completed_count: data.completed_count,
      claimed_count: data.claimed_count,
      completion_percentage: data.completion_percentage,
      unclaimed_rewards_count: unclaimed.length,
      unclaimed_achievements: unclaimed.map((a: any) => ({
        id: a.id,
        title: a.title,
        reward_coins: a.reward_coins,
        reward_xp: a.reward_xp,
      })),
      next_closest_achievement: nextClosest
        ? {
          id: nextClosest.id,
          title: nextClosest.title,
          description: nextClosest.description,
          current_progress: nextClosest.current_progress,
          target_value: nextClosest.target_value,
          remaining: Math.max(0, nextClosest.target_value - nextClosest.current_progress),
          reward_coins: nextClosest.reward_coins,
          reward_xp: nextClosest.reward_xp,
        }
        : null,
    };
  },
};

export const gamificationTools: AgentToolDefinition[] = [
  getUserAccountOverviewTool,
  getAchievementsAndRewardsTool,
];
