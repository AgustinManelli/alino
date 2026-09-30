import webpush, { type PushSubscription } from "web-push";
import type { CollectorContext, NotificationJob, PushSubscriptionItem } from "./types";

let webPushConfigured = false;

function ensureWebPushConfig(): boolean {
  if (webPushConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.warn("[web-push] VAPID keys not configured in environment variables.");
    return false;
  }

  try {
    webpush.setVapidDetails(
      "mailto:ayuda@alino.online",
      publicKey,
      privateKey
    );
    webPushConfigured = true;
    return true;
  } catch (err) {
    console.error("[web-push] Error setting VAPID details:", err);
    return false;
  }
}

export async function runWithConcurrency<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<PromiseSettledResult<R>[]> {
  const results: PromiseSettledResult<R>[] = new Array(items.length);
  let currentIndex = 0;

  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    async () => {
      while (currentIndex < items.length) {
        const idx = currentIndex++;
        try {
          const val = await fn(items[idx], idx);
          results[idx] = { status: "fulfilled", value: val };
        } catch (err) {
          results[idx] = { status: "rejected", reason: err };
        }
      }
    }
  );

  await Promise.all(workers);
  return results;
}

export async function sendPushToSubscriptionsDirect(
  subscriptions: PushSubscriptionItem[],
  job: NotificationJob,
  ctx: CollectorContext
): Promise<{ sent: number; failed: number }> {
  if (!ensureWebPushConfig() || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title: job.title,
    body: job.body,
    icon: "/manifest-icon-192.maskable.png",
    tag: job.tag,
    data: { url: job.url },
  });

  const sendOptions: webpush.RequestOptions = {
    timeout: 10000,
    TTL: job.ttl,
    urgency: job.urgency,
  };

  let sent = 0;
  let failed = 0;
  const staleEndpoints: string[] = [];

  await runWithConcurrency(subscriptions, 10, async (sub) => {
    try {
      const subObject: PushSubscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      };
      await webpush.sendNotification(subObject, payload, sendOptions);
      sent++;
    } catch (err: any) {
      failed++;
      if (err?.statusCode === 410 || err?.statusCode === 404) {
        staleEndpoints.push(sub.endpoint);
      } else {
        console.error(`[web-push] Delivery error for user ${job.userId}:`, err?.message || err);
      }
    }
  });

  if (staleEndpoints.length > 0) {
    try {
      await ctx.supabaseAdmin
        .from("push_subscriptions")
        .delete()
        .in("endpoint", staleEndpoints);
    } catch (cleanErr) {
      console.error("[web-push] Error deleting stale subscriptions:", cleanErr);
      ctx.errorsCount.value++;
    }
  }

  return { sent, failed };
}

export async function sendNotificationJobs(
  jobs: NotificationJob[],
  ctx: CollectorContext,
  concurrency = 15
): Promise<{
  dispatchedCount: number;
  dueRemindersSent: number;
  dailyDigestsSent: number;
  streakDangerSent: number;
  engagementNudgesSent: number;
}> {
  let dispatchedCount = 0;
  let dueRemindersSent = 0;
  let dailyDigestsSent = 0;
  let streakDangerSent = 0;
  let engagementNudgesSent = 0;

  await runWithConcurrency(jobs, concurrency, async (job) => {
    if (ctx.isTimeBudgetExhausted()) return;

    const subs = ctx.subscribersMap.get(job.userId);
    if (!subs || subs.length === 0) return;

    const { data: claimData, error: claimError } = await ctx.supabaseAdmin
      .from("notification_dispatches")
      .insert({
        user_id: job.userId,
        kind: job.kind,
        dedup_key: job.dedupKey,
        dispatched_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (claimError) {
      if (claimError.code === "23505") {
        return;
      }
      console.error(`[notifications] Error claiming dispatch for user ${job.userId}:`, claimError.message);
      ctx.errorsCount.value++;
      return;
    }

    const claimId = claimData?.id;
    const { sent } = await sendPushToSubscriptionsDirect(subs, job, ctx);

    if (sent === 0) {
      if (claimId) {
        await ctx.supabaseAdmin
          .from("notification_dispatches")
          .delete()
          .eq("id", claimId);
      }
      return;
    }

    dispatchedCount++;
    if (job.kind === "task_due") dueRemindersSent++;
    else if (job.kind === "daily_digest") dailyDigestsSent++;
    else if (job.kind === "streak_danger") streakDangerSent++;
    else if (job.kind === "engagement_nudge") engagementNudgesSent++;
  });

  return {
    dispatchedCount,
    dueRemindersSent,
    dailyDigestsSent,
    streakDangerSent,
    engagementNudgesSent,
  };
}
