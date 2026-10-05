import { buildStreakDangerMessage } from "../messageBuilders";
import { getUserLocalTime } from "../timeUtils";
import type { CollectorContext, NotificationJob } from "../types";

export async function collectStreakAlerts(
  ctx: CollectorContext
): Promise<NotificationJob[]> {
  const jobs: NotificationJob[] = [];
  if (ctx.isTimeBudgetExhausted() || ctx.subscribersMap.size === 0) {
    return jobs;
  }

  const eveningCandidates: Array<{
    userId: string;
    timezone: string;
    hoursUntilMidnight: number;
    todayDate: string;
  }> = [];

  for (const userId of Array.from(ctx.subscribersMap.keys())) {
    const prefs = ctx.userPreferencesMap.get(userId) || {};
    const streakSaverEnabled =
      prefs.streakSaverEnabled ?? prefs.streak_saver_enabled ?? true;
    if (!streakSaverEnabled) continue;

    const timezone =
      ctx.userTimezonesMap.get(userId) ||
      prefs.timezone ||
      "America/Argentina/Buenos_Aires";
    const userTime = getUserLocalTime(timezone);

    const hoursUntilMidnight = 24 - (userTime.hour + userTime.minute / 60);
    if (hoursUntilMidnight <= 2 && hoursUntilMidnight > 0) {
      eveningCandidates.push({
        userId,
        timezone,
        hoursUntilMidnight,
        todayDate: userTime.dateStr,
      });
    }
  }

  if (eveningCandidates.length === 0) {
    return jobs;
  }

  const candidateIds = eveningCandidates.map((c) => c.userId);
  const CHUNK_SIZE = 150;
  const streakRows: Array<{
    user_id: string;
    current_streak: number;
    is_active_today: boolean;
    total_protectors: number;
  }> = [];

  for (let i = 0; i < candidateIds.length; i += CHUNK_SIZE) {
    if (ctx.isTimeBudgetExhausted()) break;
    const chunk = candidateIds.slice(i, i + CHUNK_SIZE);
    const { data: rows, error: rpcError } = await ctx.supabaseAdmin.rpc(
      "get_users_streak_data_batch",
      { p_user_ids: chunk }
    );

    if (rpcError) {
      console.error("[notifications] Error calling get_users_streak_data_batch:", rpcError.message);
      ctx.errorsCount.value++;
    } else if (rows) {
      streakRows.push(...rows);
    }
  }

  const streakMap = new Map<string, typeof streakRows[0]>();
  for (const r of streakRows) {
    streakMap.set(r.user_id, r);
  }

  for (const candidate of eveningCandidates) {
    if (ctx.isTimeBudgetExhausted()) break;
    const s = streakMap.get(candidate.userId);
    if (!s) continue;
    if (s.current_streak > 0 && !s.is_active_today) {
      const prefs = ctx.userPreferencesMap.get(candidate.userId) || {};
      const userLang = (prefs.language as import("@/lib/i18n/types").SupportedLanguage) || "es";
      const message = buildStreakDangerMessage(
        s.current_streak,
        candidate.hoursUntilMidnight,
        s.total_protectors || 0,
        userLang
      );

      jobs.push({
        userId: candidate.userId,
        kind: "streak_danger",
        dedupKey: candidate.todayDate,
        title: message.title,
        body: message.body,
        url: "/alino-app",
        tag: "alino-streak-danger",
        ttl: 10800,
        urgency: "high",
        priority: 2,
      });
    }
  }

  return jobs;
}
