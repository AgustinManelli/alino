import { buildDailyDigestMessage } from "../messageBuilders";
import { getUserLocalTime } from "../timeUtils";
import type { CollectorContext, NotificationJob } from "../types";

export async function collectDailyDigests(
  ctx: CollectorContext
): Promise<NotificationJob[]> {
  const jobs: NotificationJob[] = [];
  if (ctx.isTimeBudgetExhausted() || ctx.subscribersMap.size === 0) {
    return jobs;
  }

  const morningCandidates: Array<{
    userId: string;
    todayDate: string;
  }> = [];

  for (const userId of Array.from(ctx.subscribersMap.keys())) {
    const prefs = ctx.userPreferencesMap.get(userId) || {};
    const dailyDigestEnabled =
      prefs.dailyDigestEnabled ?? prefs.daily_digest_enabled ?? true;
    if (!dailyDigestEnabled) continue;

    const timezone =
      ctx.userTimezonesMap.get(userId) ||
      prefs.timezone ||
      "America/Argentina/Buenos_Aires";
    const rawDigestTime =
      prefs.dailyDigestTime ?? prefs.daily_digest_time ?? "09:00";
    const userTime = getUserLocalTime(timezone);

    const timeMatch =
      typeof rawDigestTime === "string" &&
      rawDigestTime.match(/^(\d{1,2}):(\d{2})$/);
    const targetHour = timeMatch ? parseInt(timeMatch[1], 10) : 9;
    const targetMinute = timeMatch ? parseInt(timeMatch[2], 10) : 0;

    const currentMinutes = userTime.hour * 60 + userTime.minute;
    const targetMinutes = targetHour * 60 + targetMinute;
    const diffMinutes = currentMinutes - targetMinutes;

    const isTimeToDeliver = diffMinutes >= 0 && diffMinutes <= 300;

    if (isTimeToDeliver) {
      morningCandidates.push({
        userId,
        todayDate: userTime.dateStr,
      });
    }
  }

  if (morningCandidates.length === 0) {
    return jobs;
  }

  const candidateIds = morningCandidates.map((c) => c.userId);
  const todayDates = Array.from(new Set(morningCandidates.map((c) => c.todayDate)));

  const { data: existingDispatches } = await ctx.supabaseAdmin
    .from("notification_dispatches")
    .select("user_id, dedup_key")
    .eq("kind", "daily_digest")
    .in("user_id", candidateIds)
    .in("dedup_key", todayDates);

  const alreadySentSet = new Set(
    (existingDispatches || []).map((d: any) => `${d.user_id}:${d.dedup_key}`)
  );

  const pendingCandidates = morningCandidates.filter(
    (c) => !alreadySentSet.has(`${c.userId}:${c.todayDate}`)
  );

  if (pendingCandidates.length === 0) {
    return jobs;
  }

  const pendingIds = pendingCandidates.map((c) => c.userId);
  const CHUNK_SIZE = 150;
  const countRows: Array<{
    user_id: string;
    due_today_count: number | string;
    overdue_count: number | string;
    total_pending: number | string;
  }> = [];

  for (let i = 0; i < pendingIds.length; i += CHUNK_SIZE) {
    if (ctx.isTimeBudgetExhausted()) break;
    const chunk = pendingIds.slice(i, i + CHUNK_SIZE);
    const { data: rows, error: rpcError } = await ctx.supabaseAdmin.rpc(
      "get_users_digest_task_counts",
      { p_user_ids: chunk }
    );

    if (rpcError) {
      console.error("[notifications] Error calling get_users_digest_task_counts:", rpcError.message);
      ctx.errorsCount.value++;
    } else if (rows) {
      countRows.push(...rows);
    }
  }

  const countsMap = new Map<string, typeof countRows[0]>();
  for (const r of countRows) {
    countsMap.set(r.user_id, r);
  }

  for (const candidate of pendingCandidates) {
    if (ctx.isTimeBudgetExhausted()) break;

    const counts = countsMap.get(candidate.userId);
    const dueToday = counts ? Number(counts.due_today_count || 0) : 0;
    const overdue = counts ? Number(counts.overdue_count || 0) : 0;
    const totalPending = counts ? Number(counts.total_pending || 0) : 0;

    const prefs = ctx.userPreferencesMap.get(candidate.userId) || {};
    const userLang = (prefs.language as import("@/lib/i18n/types").SupportedLanguage) || "es";
    const message = buildDailyDigestMessage(dueToday, overdue, totalPending, userLang);

    jobs.push({
      userId: candidate.userId,
      kind: "daily_digest",
      dedupKey: candidate.todayDate,
      title: message.title,
      body: message.body,
      url: "/alino-app",
      tag: "alino-daily-digest",
      ttl: 14400,
      urgency: "normal",
      priority: 3,
    });
  }

  return jobs;
}
