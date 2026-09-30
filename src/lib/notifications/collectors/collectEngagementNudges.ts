import {
  buildNudgeNearAchievementMessage,
  buildNudgeOrganizeMessage,
  buildNudgeRewardMessage,
} from "../messageBuilders";
import { getUserLocalTime } from "../timeUtils";
import type { CollectorContext, NotificationJob } from "../types";

export async function collectEngagementNudges(
  ctx: CollectorContext
): Promise<NotificationJob[]> {
  const jobs: NotificationJob[] = [];
  if (ctx.isTimeBudgetExhausted() || ctx.subscribersMap.size === 0) {
    return jobs;
  }

  const subscriberIds = Array.from(ctx.subscribersMap.keys());
  const oneDayAgo = new Date(ctx.nowMs - 24 * 60 * 60 * 1000).toISOString();

  const { data: recentDispatches, error: dispError } = await ctx.supabaseAdmin
    .from("notification_dispatches")
    .select("user_id, dedup_key, dispatched_at")
    .eq("kind", "engagement_nudge")
    .gte("dispatched_at", oneDayAgo);

  if (dispError) {
    console.error("[notifications] Error querying recent engagement nudges:", dispError.message);
    ctx.errorsCount.value++;
  }

  const recentNudgeUserIds = new Set(
    (recentDispatches || []).map((d) => d.user_id)
  );

  const eligibleUserIds = subscriberIds.filter(
    (uid) => !recentNudgeUserIds.has(uid)
  );

  if (eligibleUserIds.length === 0) {
    return jobs;
  }

  for (let i = eligibleUserIds.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = eligibleUserIds[i];
    eligibleUserIds[i] = eligibleUserIds[j];
    eligibleUserIds[j] = temp;
  }

  const BATCH_LIMIT = 15;
  const candidatesToInspect = eligibleUserIds.slice(0, BATCH_LIMIT);

  for (const userId of candidatesToInspect) {
    if (ctx.isTimeBudgetExhausted()) break;

    const timezone =
      ctx.userTimezonesMap.get(userId) || "America/Argentina/Buenos_Aires";
    const userTime = getUserLocalTime(timezone);

    try {
      const { data: achievementsOverview, error: achError } =
        await ctx.supabaseAdmin.rpc("get_user_achievements_overview", {
          p_user_id: userId,
        });

      if (achError) {
        console.error(`[notifications] Error checking achievements for user ${userId}:`, achError.message);
        ctx.errorsCount.value++;
        continue;
      }

      const overview = achievementsOverview as any;
      const achievements: Array<any> = overview?.achievements || [];

      const unclaimed = achievements.filter(
        (a) => a.is_completed === true && a.is_claimed === false
      );

      if (unclaimed.length > 0) {
        const message = buildNudgeRewardMessage(
          unclaimed.length,
          unclaimed[0].title
        );

        jobs.push({
          userId,
          kind: "engagement_nudge",
          dedupKey: `unclaimed:${userTime.dateStr}`,
          title: message.title,
          body: message.body,
          url: "/alino-app",
          tag: "alino-nudge",
          ttl: 21600,
          urgency: "normal",
          priority: 4,
        });
        continue;
      }

      const nearCompletion = achievements.find(
        (a) =>
          !a.is_completed &&
          a.target_value > 0 &&
          a.current_progress / a.target_value >= 0.8
      );

      if (nearCompletion) {
        const percentage = Math.round(
          (nearCompletion.current_progress / nearCompletion.target_value) * 100
        );
        const message = buildNudgeNearAchievementMessage(
          nearCompletion.title,
          percentage
        );

        jobs.push({
          userId,
          kind: "engagement_nudge",
          dedupKey: `near:${nearCompletion.id || nearCompletion.title}:${userTime.dateStr}`,
          title: message.title,
          body: message.body,
          url: "/alino-app",
          tag: "alino-nudge",
          ttl: 21600,
          urgency: "normal",
          priority: 4,
        });
        continue;
      }

      if (userTime.hour >= 11 && userTime.hour <= 17) {
        const twoDaysAgo = new Date(
          ctx.nowMs - 48 * 60 * 60 * 1000
        ).toISOString();

        const { data: pastOrganize, error: orgError } = await ctx.supabaseAdmin
          .from("notification_dispatches")
          .select("id")
          .eq("user_id", userId)
          .eq("kind", "engagement_nudge")
          .eq("dedup_key", "organize_day")
          .gte("dispatched_at", twoDaysAgo)
          .limit(1);

        if (orgError) {
          console.error(`[notifications] Error checking organize dispatches for user ${userId}:`, orgError.message);
          ctx.errorsCount.value++;
        }

        const hasRecentOrganize = (pastOrganize || []).length > 0;

        if (!hasRecentOrganize) {
          const { count, error: taskCountError } = await ctx.supabaseAdmin
            .from("list_memberships")
            .select("list_id, tasks!inner(task_id)", {
              count: "exact",
              head: true,
            })
            .eq("user_id", userId)
            .eq("tasks.completed", false);

          if (taskCountError) {
            console.error(`[notifications] Error checking pending tasks for organize nudge for user ${userId}:`, taskCountError.message);
            ctx.errorsCount.value++;
          }

          if (count && count > 0) {
            const message = buildNudgeOrganizeMessage();

            jobs.push({
              userId,
              kind: "engagement_nudge",
              dedupKey: "organize_day",
              title: message.title,
              body: message.body,
              url: "/alino-app",
              tag: "alino-nudge",
              ttl: 21600,
              urgency: "normal",
              priority: 4,
            });
          }
        }
      }
    } catch (err: any) {
      console.error(`[notifications] Unexpected error checking nudges for user ${userId}:`, err?.message || err);
      ctx.errorsCount.value++;
    }
  }

  return jobs;
}
