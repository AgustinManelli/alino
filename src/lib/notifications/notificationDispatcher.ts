import webpush, { type PushSubscription } from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";

let webPushConfigured = false;

function ensureWebPushConfig() {
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

export function stripHtml(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

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
  icon = "/manifest-icon-192.maskable.png",
  supabaseAdmin,
}: SendPushParams): Promise<{ sent: number; failed: number }> {
  if (!ensureWebPushConfig()) {
    return { sent: 0, failed: 0 };
  }

  const { data: subscriptions, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (error || !subscriptions || subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const payload = JSON.stringify({
    title,
    body,
    icon,
    data: { url },
  });

  let sent = 0;
  let failed = 0;

  await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        const subObject: PushSubscription = {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        };
        await webpush.sendNotification(subObject, payload);
        sent++;
      } catch (err: any) {
        failed++;
        if (err?.statusCode === 410 || err?.statusCode === 404) {
          console.log(`[web-push] Stale subscription detected: ${sub.endpoint}. Removing.`);
          await supabaseAdmin
            .from("push_subscriptions")
            .delete()
            .eq("endpoint", sub.endpoint);
        } else {
          console.error("[web-push] Delivery error:", err?.message || err);
        }
      }
    })
  );

  return { sent, failed };
}

export interface PushDispatchLog {
  last_daily_digest_date?: string;
  alerted_tasks?: Record<string, string>;
  last_streak_danger_date?: string;
  last_engagement_nudge_at?: string;
  last_engagement_organize_at?: string;
}

export function getUserLocalTime(timezone: string) {
  try {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "";
    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");
    const hour = parseInt(getPart("hour"), 10) || 0;
    const minute = parseInt(getPart("minute"), 10) || 0;
    const dateStr = `${year}-${month}-${day}`;
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    return { dateStr, timeStr, hour, minute };
  } catch {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const hour = now.getUTCHours();
    const minute = now.getUTCMinutes();
    const timeStr = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
    return { dateStr, timeStr, hour, minute };
  }
}

export async function evaluateAndDispatchUserNotifications(
  userId: string,
  supabaseAdmin: SupabaseClient
): Promise<{ dispatched: string[] }> {
  const dispatched: string[] = [];

  const { data: userPrivate } = await supabaseAdmin
    .from("user_private")
    .select("preferences")
    .eq("user_id", userId)
    .maybeSingle();

  const prefs = (userPrivate?.preferences || {}) as Record<string, any>;
  const dailyDigestEnabled = prefs.dailyDigestEnabled ?? prefs.daily_digest_enabled ?? true;
  const dailyDigestTime = prefs.dailyDigestTime ?? prefs.daily_digest_time ?? "09:00";
  const dueRemindersEnabled = prefs.dueRemindersEnabled ?? prefs.due_reminders_enabled ?? true;
  const dueLeadTimeMinutes = Number(prefs.dueLeadTimeMinutes ?? prefs.due_lead_time_minutes ?? 30);
  const streakSaverEnabled = prefs.streakSaverEnabled ?? prefs.streak_saver_enabled ?? true;
  const timezone = prefs.timezone ?? prefs.user_timezone ?? "America/Argentina/Buenos_Aires";

  const dispatchLog: PushDispatchLog = { ...(prefs.push_dispatch_log || {}) };
  let hasLogUpdates = false;

  const userTime = getUserLocalTime(timezone);

  const { data: userMemberships } = await supabaseAdmin
    .from("list_memberships")
    .select("list_id")
    .eq("user_id", userId);

  const listIds = (userMemberships || []).map((m: any) => m.list_id);

  let pendingTasks: Array<{ task_id: string; task_content: string; target_date: string | null }> = [];
  if (listIds.length > 0) {
    const { data: tasksData } = await supabaseAdmin
      .from("tasks")
      .select("task_id, task_content, target_date")
      .in("list_id", listIds)
      .eq("completed", false);
    pendingTasks = tasksData || [];
  }

  if (dailyDigestEnabled) {
    const [targetHour, targetMinute] = dailyDigestTime
      .split(":")
      .map((v: string) => parseInt(v, 10) || 0);

    const isPastTargetTime =
      userTime.hour > targetHour ||
      (userTime.hour === targetHour && userTime.minute >= targetMinute);

    const alreadySentDaily = dispatchLog.last_daily_digest_date === userTime.dateStr;

    if (isPastTargetTime && !alreadySentDaily) {
      let dueTodayCount = 0;
      let overdueCount = 0;

      for (const t of pendingTasks) {
        if (t.target_date) {
          const taskDate = t.target_date.slice(0, 10);
          if (taskDate === userTime.dateStr) {
            dueTodayCount++;
          } else if (taskDate < userTime.dateStr) {
            overdueCount++;
          }
        }
      }

      let title = "☀️ Resumen de hoy";
      let body = "";

      if (dueTodayCount > 0) {
        body = overdueCount > 0
          ? `Tienes ${dueTodayCount} ${dueTodayCount === 1 ? "tarea para hoy" : "tareas para hoy"} y ${overdueCount} atrasadas. ¡A por ellas!`
          : `Tienes ${dueTodayCount} ${dueTodayCount === 1 ? "tarea prevista" : "tareas previstas"} para hoy. ¡Haz que tu día rinda!`;
      } else if (overdueCount > 0) {
        title = "☀️ Tareas pendientes";
        body = `Tienes ${overdueCount} ${overdueCount === 1 ? "tarea pendiente" : "tareas pendientes"} esperando tu atención. ¡Buen momento para avanzar!`;
      } else if (pendingTasks.length > 0) {
        body = `Tienes ${pendingTasks.length} tareas organizadas. ¡Dedica unos minutos a planificar tu jornada!`;
      } else {
        title = "☀️ ¡Todo al día!";
        body = "No tienes tareas pendientes para hoy. ¡Aprovecha para descansar o definir nuevos objetivos!";
      }

      await sendPushToUser({
        userId,
        title,
        body,
        url: "/alino-app",
        supabaseAdmin,
      });

      dispatchLog.last_daily_digest_date = userTime.dateStr;
      hasLogUpdates = true;
      dispatched.push("daily_digest");
    }
  }

  if (dueRemindersEnabled && pendingTasks.length > 0) {
    const nowMs = Date.now();
    const maxDueTimeMs = nowMs + Math.max(5, dueLeadTimeMinutes + 10) * 60 * 1000;

    const currentAlertedTasks = { ...(dispatchLog.alerted_tasks || {}) };
    for (const [tId, tDate] of Object.entries(currentAlertedTasks)) {
      if (new Date(tDate).getTime() < nowMs - 2 * 86400000) {
        delete currentAlertedTasks[tId];
      }
    }

    for (const task of pendingTasks) {
      if (!task.target_date) continue;
      const targetTimeMs = new Date(task.target_date).getTime();

      if (targetTimeMs > nowMs && targetTimeMs <= maxDueTimeMs) {
        const alreadyAlerted = Boolean(currentAlertedTasks[task.task_id]);

        if (!alreadyAlerted) {
          const minutesRemaining = Math.max(
            1,
            Math.round((targetTimeMs - nowMs) / 60000)
          );

          const cleanContent = stripHtml(task.task_content) || "Tarea pendiente";
          const title = "⏰ Tarea por vencer";
          const body = `"${cleanContent}" vence en ${minutesRemaining} ${minutesRemaining === 1 ? "minuto" : "minutos"}. ¡No lo olvides!`;

          await sendPushToUser({
            userId,
            title,
            body,
            url: "/alino-app",
            supabaseAdmin,
          });

          currentAlertedTasks[task.task_id] = task.target_date;
          dispatchLog.alerted_tasks = currentAlertedTasks;
          hasLogUpdates = true;
          dispatched.push(`task_due:${task.task_id}`);
        }
      }
    }
  }

  if (streakSaverEnabled) {
    const hoursUntilMidnight = 24 - (userTime.hour + userTime.minute / 60);

    if (hoursUntilMidnight <= 3.5 && hoursUntilMidnight > 0) {
      const alreadySentStreakAlert = dispatchLog.last_streak_danger_date === userTime.dateStr;

      if (!alreadySentStreakAlert) {
        let currentStreak = 0;
        let isActiveToday = false;
        let totalProtectors = 0;

        try {
          const { data: streakData, error: streakErr } = await supabaseAdmin.rpc(
            "get_user_streak_data",
            { p_user_id: userId, p_timezone: timezone }
          );

          if (!streakErr && streakData) {
            currentStreak = streakData.current_streak || 0;
            isActiveToday = Boolean(streakData.is_active_today);
            const freeLeft = Math.max(
              0,
              (streakData.free_protectors_limit || 0) - (streakData.free_protectors_used || 0)
            );
            const purchased = streakData.purchased_protectors || 0;
            totalProtectors = freeLeft + purchased;
          } else {
            const { data: streakRow } = await supabaseAdmin
              .from("user_streaks")
              .select("current_streak, last_completion_date")
              .eq("user_id", userId)
              .maybeSingle();

            if (streakRow) {
              currentStreak = streakRow.current_streak || 0;
              isActiveToday = streakRow.last_completion_date === userTime.dateStr;
            }
          }
        } catch {
          const { data: streakRow } = await supabaseAdmin
            .from("user_streaks")
            .select("current_streak, last_completion_date")
            .eq("user_id", userId)
            .maybeSingle();

          if (streakRow) {
            currentStreak = streakRow.current_streak || 0;
            isActiveToday = streakRow.last_completion_date === userTime.dateStr;
          }
        }

        if (currentStreak > 0 && !isActiveToday) {
          const hoursCeil = Math.max(1, Math.ceil(hoursUntilMidnight));
          let title = "";
          let body = "";

          if (totalProtectors > 0) {
            title = "🛡️ Tu racha usará un protector esta noche";
            body = `Faltan ~${hoursCeil} horas para medianoche. Completa una tarea hoy para no gastar tus protectores (${totalProtectors} disponible${totalProtectors > 1 ? "s" : ""}).`;
          } else {
            title = `🔥 ¡Tu racha de ${currentStreak} ${currentStreak === 1 ? "día" : "días"} está por perderse!`;
            body = `No te quedan protectores disponibles. Completa al menos una tarea antes de medianoche para salvar tu racha.`;
          }

          await sendPushToUser({
            userId,
            title,
            body,
            url: "/alino-app",
            supabaseAdmin,
          });

          dispatchLog.last_streak_danger_date = userTime.dateStr;
          hasLogUpdates = true;
          dispatched.push("streak_danger");
        }
      }
    }
  }

  const nowMs = Date.now();
  const lastNudgeMs = dispatchLog.last_engagement_nudge_at
    ? new Date(dispatchLog.last_engagement_nudge_at).getTime()
    : 0;
  const hasRecentEngagementNudge = nowMs - lastNudgeMs < 24 * 60 * 60 * 1000;

  if (!hasRecentEngagementNudge) {
    try {
      const { data: achievementsOverview } = await supabaseAdmin.rpc(
        "get_user_achievements_overview",
        { p_user_id: userId }
      );

      const overview = achievementsOverview as any;
      const achievements: Array<any> = overview?.achievements || [];

      const unclaimed = achievements.filter(
        (a) => a.is_completed === true && a.is_claimed === false
      );

      if (unclaimed.length > 0) {
        const title = "🎁 ¡Tienes recompensas listas para reclamar!";
        const body = unclaimed.length === 1
          ? `Completaste el logro "${unclaimed[0].title}". ¡Entra a Alino y reclama tus Alino Coins y XP!`
          : `Tienes ${unclaimed.length} recompensas de logros esperando por ti. ¡Entra a recogerlas!`;

        await sendPushToUser({
          userId,
          title,
          body,
          url: "/alino-app",
          supabaseAdmin,
        });

        dispatchLog.last_engagement_nudge_at = new Date().toISOString();
        hasLogUpdates = true;
        dispatched.push("engagement_nudge:unclaimed_rewards");
      } else {
        const nearCompletion = achievements.find(
          (a) =>
            !a.is_completed &&
            a.target_value > 0 &&
            (a.current_progress / a.target_value) >= 0.8
        );

        if (nearCompletion) {
          const percentage = Math.round(
            (nearCompletion.current_progress / nearCompletion.target_value) * 100
          );
          const title = "🎯 ¡Estás muy cerca de un logro!";
          const body = `Estás al ${percentage}% de "${nearCompletion.title}". ¡Completa un paso más y desbloquéalo hoy!`;

          await sendPushToUser({
            userId,
            title,
            body,
            url: "/alino-app",
            supabaseAdmin,
          });

          dispatchLog.last_engagement_nudge_at = new Date().toISOString();
          hasLogUpdates = true;
          dispatched.push("engagement_nudge:near_achievement");
        } else if (pendingTasks.length > 0 && userTime.hour >= 11 && userTime.hour <= 17) {
          const lastOrganizeMs = dispatchLog.last_engagement_organize_at
            ? new Date(dispatchLog.last_engagement_organize_at).getTime()
            : 0;
          const hasRecentOrganize = nowMs - lastOrganizeMs < 48 * 60 * 60 * 1000;

          if (!hasRecentOrganize) {
            const title = "✨ Organiza tu día en Alino";
            const body = "Tus pendientes te esperan. Tómate 2 minutos para despejar tu mente y avanzar en tus metas.";

            await sendPushToUser({
              userId,
              title,
              body,
              url: "/alino-app",
              supabaseAdmin,
            });

            dispatchLog.last_engagement_nudge_at = new Date().toISOString();
            dispatchLog.last_engagement_organize_at = new Date().toISOString();
            hasLogUpdates = true;
            dispatched.push("engagement_nudge:organize_nudge");
          }
        }
      }
    } catch (err) {
      console.error("[notifications] Error in loyalty/achievements evaluation:", err);
    }
  }

  if (hasLogUpdates) {
    try {
      await supabaseAdmin
        .from("user_private")
        .update({
          preferences: {
            ...prefs,
            push_dispatch_log: dispatchLog,
          },
        })
        .eq("user_id", userId);
    } catch (err) {
      console.error("[notifications] Error saving push_dispatch_log to user_private:", err);
    }
  }

  return { dispatched };
}

export async function dispatchAllNotifications(supabaseAdmin: SupabaseClient) {
  const { data: subs, error } = await supabaseAdmin
    .from("push_subscriptions")
    .select("user_id");

  if (error || !subs || subs.length === 0) {
    return { processedUsers: 0, dispatchedCount: 0 };
  }

  const userIds = Array.from(new Set(subs.map((s: any) => s.user_id as string)));
  let dispatchedCount = 0;

  const CONCURRENCY = 5;
  for (let i = 0; i < userIds.length; i += CONCURRENCY) {
    const chunk = userIds.slice(i, i + CONCURRENCY);
    const results = await Promise.allSettled(
      chunk.map((uid) => evaluateAndDispatchUserNotifications(uid, supabaseAdmin))
    );

    for (const res of results) {
      if (res.status === "fulfilled") {
        dispatchedCount += res.value.dispatched.length;
      } else {
        console.error("[cron-notifications] Error processing user:", res.reason);
      }
    }
  }

  return { processedUsers: userIds.length, dispatchedCount };
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
