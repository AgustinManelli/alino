import type { SupabaseClient } from "@supabase/supabase-js";
import { collectDueReminders } from "./collectors/collectDueReminders";
import { collectStreakAlerts } from "./collectors/collectStreakAlerts";
import { collectDailyDigests } from "./collectors/collectDailyDigests";
import { collectEngagementNudges } from "./collectors/collectEngagementNudges";
import {
  sendNotificationJobs,
  sendPushToSubscriptionsDirect,
} from "./notificationSender";
import { stripHtml } from "./messageBuilders";
import { getUserLocalTime } from "./timeUtils";
import type {
  CollectorContext,
  DispatchSummary,
  NotificationJob,
  PushSubscriptionItem,
} from "./types";

export { stripHtml, getUserLocalTime };

export interface SendPushParams {
  userId: string;
  title: string;
  body: string;
  url?: string;
  icon?: string;
  supabaseAdmin: SupabaseClient;
}

export async function sendPushToUser({
  userId,
  title,
  body,
  url = "/alino-app",
  supabaseAdmin,
}: SendPushParams): Promise<{ sent: number; failed: number }> {
  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error) {
    console.error(`[notifications] Error fetching subscriptions for user ${userId}:`, error.message);
    return { sent: 0, failed: 0 };
  }

  if (!subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const dummyContext: CollectorContext = {
    supabaseAdmin,
    now: new Date(),
    nowMs: Date.now(),
    isTimeBudgetExhausted: () => false,
    subscribersMap: new Map(),
    userTimezonesMap: new Map(),
    userPreferencesMap: new Map(),
    errorsCount: { value: 0 },
  };

  const dummyJob: NotificationJob = {
    userId,
    kind: "task_due",
    dedupKey: `direct_${Date.now()}`,
    title,
    body,
    url,
    tag: "alino-direct",
    ttl: 3600,
    urgency: "high",
    priority: 1,
  };

  return sendPushToSubscriptionsDirect(subscriptions, dummyJob, dummyContext);
}

export async function sendTestNotificationToUser(
  userId: string,
  supabaseAdmin: SupabaseClient
) {
  const title = "✨ Notificaciones de Alino activadas";
  const body =
    "¡Tu configuración de notificaciones funciona a la perfección! Recibirás tus resúmenes y alertas a tiempo.";

  return await sendPushToUser({
    userId,
    title,
    body,
    url: "/alino-app",
    supabaseAdmin,
  });
}

export interface DispatchOptions {
  timeBudgetMs?: number;
}

export async function dispatchAllNotifications(
  supabaseAdmin: SupabaseClient,
  options: DispatchOptions = {}
): Promise<DispatchSummary> {
  const startTime = Date.now();
  const timeBudgetMs = options.timeBudgetMs || 40_000;
  const isTimeBudgetExhausted = () => Date.now() - startTime >= timeBudgetMs;

  const errorsCount = { value: 0 };
  let timeBudgetExceeded = false;
  let unprocessedUsersCount = 0;

  const subscribersMap = new Map<string, PushSubscriptionItem[]>();
  let page = 0;
  const PAGE_SIZE = 1000;

  while (true) {
    if (isTimeBudgetExhausted()) {
      timeBudgetExceeded = true;
      break;
    }

    const { data: pageData, error: pageError } = await supabaseAdmin
      .from("push_subscriptions")
      .select("user_id, endpoint, p256dh, auth")
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (pageError) {
      console.error("[notifications] Error loading push subscriptions page:", pageError.message);
      errorsCount.value++;
      break;
    }

    if (!pageData || pageData.length === 0) break;

    for (const sub of pageData) {
      const list = subscribersMap.get(sub.user_id) || [];
      list.push({ endpoint: sub.endpoint, p256dh: sub.p256dh, auth: sub.auth });
      subscribersMap.set(sub.user_id, list);
    }

    if (pageData.length < PAGE_SIZE) break;
    page++;
  }

  const subscriberIds = Array.from(subscribersMap.keys());
  const userTimezonesMap = new Map<string, string>();
  const userPreferencesMap = new Map<string, Record<string, any>>();

  const CHUNK_SIZE = 150;
  for (let i = 0; i < subscriberIds.length; i += CHUNK_SIZE) {
    if (isTimeBudgetExhausted()) {
      timeBudgetExceeded = true;
      unprocessedUsersCount = subscriberIds.length - i;
      break;
    }

    const chunk = subscriberIds.slice(i, i + CHUNK_SIZE);
    const [usersRes, privRes] = await Promise.all([
      supabaseAdmin
        .from("users")
        .select("user_id, timezone")
        .in("user_id", chunk),
      supabaseAdmin
        .from("user_private")
        .select("user_id, preferences")
        .in("user_id", chunk),
    ]);

    if (usersRes.error) {
      console.error("[notifications] Error loading users timezone chunk:", usersRes.error.message);
      errorsCount.value++;
    } else if (usersRes.data) {
      for (const u of usersRes.data) {
        if (u.timezone) userTimezonesMap.set(u.user_id, u.timezone);
      }
    }

    if (privRes.error) {
      console.error("[notifications] Error loading user_private preferences chunk:", privRes.error.message);
      errorsCount.value++;
    } else if (privRes.data) {
      for (const p of privRes.data) {
        const prefs = (p.preferences || {}) as Record<string, any>;
        userPreferencesMap.set(p.user_id, prefs);
        if (!userTimezonesMap.has(p.user_id) && prefs.timezone) {
          userTimezonesMap.set(p.user_id, prefs.timezone);
        }
      }
    }
  }

  const now = new Date();
  const ctx: CollectorContext = {
    supabaseAdmin,
    now,
    nowMs: now.getTime(),
    isTimeBudgetExhausted,
    subscribersMap,
    userTimezonesMap,
    userPreferencesMap,
    errorsCount,
  };

  const rawJobs: NotificationJob[] = [];

  const dueJobs = await collectDueReminders(ctx);
  rawJobs.push(...dueJobs);

  if (!isTimeBudgetExhausted()) {
    const streakJobs = await collectStreakAlerts(ctx);
    rawJobs.push(...streakJobs);
  } else {
    timeBudgetExceeded = true;
  }

  if (!isTimeBudgetExhausted()) {
    const digestJobs = await collectDailyDigests(ctx);
    rawJobs.push(...digestJobs);
  } else {
    timeBudgetExceeded = true;
  }

  if (!isTimeBudgetExhausted()) {
    const nudgeJobs = await collectEngagementNudges(ctx);
    rawJobs.push(...nudgeJobs);
  } else {
    timeBudgetExceeded = true;
  }

  const jobsByUser = new Map<string, NotificationJob[]>();
  for (const job of rawJobs) {
    const existing = jobsByUser.get(job.userId) || [];
    existing.push(job);
    jobsByUser.set(job.userId, existing);
  }

  const finalJobs: NotificationJob[] = [];
  for (const userJobList of Array.from(jobsByUser.values())) {
    userJobList.sort((a: NotificationJob, b: NotificationJob) => a.priority - b.priority);
    finalJobs.push(userJobList[0]);
  }

  const sendResults = await sendNotificationJobs(finalJobs, ctx, 15);

  return {
    status: "success",
    timestamp: new Date().toISOString(),
    processedUsers: subscriberIds.length,
    dispatchedCount: sendResults.dispatchedCount,
    dueRemindersSent: sendResults.dueRemindersSent,
    dailyDigestsSent: sendResults.dailyDigestsSent,
    streakDangerSent: sendResults.streakDangerSent,
    engagementNudgesSent: sendResults.engagementNudgesSent,
    errorsCount: errorsCount.value,
    timeBudgetExceeded,
    unprocessedUsersCount,
    durationMs: Date.now() - startTime,
  };
}

export async function evaluateAndDispatchUserNotifications(
  userId: string,
  supabaseAdmin: SupabaseClient
): Promise<{ dispatched: string[] }> {
  const dispatched: string[] = [];

  const { data: subs, error: subsError } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (subsError || !subs || subs.length === 0) {
    return { dispatched };
  }

  const [userRes, privRes] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("user_id, timezone")
      .eq("user_id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("user_private")
      .select("preferences")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  const timezone =
    userRes.data?.timezone ||
    (privRes.data?.preferences as any)?.timezone ||
    "America/Argentina/Buenos_Aires";

  const prefs = (privRes.data?.preferences || {}) as Record<string, any>;

  const subscribersMap = new Map<string, PushSubscriptionItem[]>();
  subscribersMap.set(userId, subs);

  const userTimezonesMap = new Map<string, string>();
  userTimezonesMap.set(userId, timezone);

  const userPreferencesMap = new Map<string, Record<string, any>>();
  userPreferencesMap.set(userId, prefs);

  const now = new Date();
  const ctx: CollectorContext = {
    supabaseAdmin,
    now,
    nowMs: now.getTime(),
    isTimeBudgetExhausted: () => false,
    subscribersMap,
    userTimezonesMap,
    userPreferencesMap,
    errorsCount: { value: 0 },
  };

  const rawJobs: NotificationJob[] = [];
  const dueJobs = await collectDueReminders(ctx);
  rawJobs.push(...dueJobs);

  const streakJobs = await collectStreakAlerts(ctx);
  rawJobs.push(...streakJobs);

  const digestJobs = await collectDailyDigests(ctx);
  rawJobs.push(...digestJobs);

  const nudgeJobs = await collectEngagementNudges(ctx);
  rawJobs.push(...nudgeJobs);

  rawJobs.sort((a: NotificationJob, b: NotificationJob) => a.priority - b.priority);

  if (rawJobs.length > 0) {
    const jobToExecute = rawJobs[0];
    await sendNotificationJobs([jobToExecute], ctx, 1);
    dispatched.push(jobToExecute.kind);
  }

  return { dispatched };
}
