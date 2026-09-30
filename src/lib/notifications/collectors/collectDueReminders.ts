import { buildTaskDueMessage } from "../messageBuilders";
import type { CollectorContext, NotificationJob, TaskDueItem } from "../types";

export async function collectDueReminders(
  ctx: CollectorContext
): Promise<NotificationJob[]> {
  const jobs: NotificationJob[] = [];
  if (ctx.isTimeBudgetExhausted() || ctx.subscribersMap.size === 0) {
    return jobs;
  }

  let maxLeadMinutes = 30;
  for (const prefs of Array.from(ctx.userPreferencesMap.values())) {
    const userLead = Number(
      prefs.dueLeadTimeMinutes ?? prefs.due_lead_time_minutes ?? 30
    );
    if (userLead > maxLeadMinutes) {
      maxLeadMinutes = userLead;
    }
  }

  const windowStart = ctx.now;
  const windowEnd = new Date(ctx.nowMs + maxLeadMinutes * 60 * 1000);

  const { data: rawUpcomingTasks, error: tasksError } = await ctx.supabaseAdmin
    .from("tasks")
    .select("task_id, task_content, target_date, list_id")
    .is("completed", false)
    .gte("target_date", windowStart.toISOString())
    .lte("target_date", windowEnd.toISOString())
    .order("target_date", { ascending: true })
    .limit(1000);

  if (tasksError) {
    console.error("[notifications] Error fetching upcoming tasks:", tasksError.message);
    ctx.errorsCount.value++;
    return jobs;
  }

  if (!rawUpcomingTasks || rawUpcomingTasks.length === 0) {
    return jobs;
  }

  const upcomingTasks: TaskDueItem[] = rawUpcomingTasks.filter(
    (t): t is TaskDueItem => Boolean(t.target_date)
  );

  const uniqueListIds = Array.from(new Set(upcomingTasks.map((t) => t.list_id)));
  const tasksByListId = new Map<string, TaskDueItem[]>();
  for (const task of upcomingTasks) {
    const list = tasksByListId.get(task.list_id) || [];
    list.push(task);
    tasksByListId.set(task.list_id, list);
  }

  const LIST_CHUNK_SIZE = 150;
  const memberships: Array<{ list_id: string; user_id: string }> = [];

  for (let i = 0; i < uniqueListIds.length; i += LIST_CHUNK_SIZE) {
    if (ctx.isTimeBudgetExhausted()) break;
    const chunk = uniqueListIds.slice(i, i + LIST_CHUNK_SIZE);
    const { data: memData, error: memError } = await ctx.supabaseAdmin
      .from("list_memberships")
      .select("list_id, user_id")
      .in("list_id", chunk);

    if (memError) {
      console.error("[notifications] Error fetching list memberships:", memError.message);
      ctx.errorsCount.value++;
    } else if (memData) {
      memberships.push(...memData);
    }
  }

  const tasksByUser = new Map<string, TaskDueItem[]>();
  for (const m of memberships) {
    if (!ctx.subscribersMap.has(m.user_id)) continue;
    const listTasks = tasksByListId.get(m.list_id) || [];
    if (listTasks.length === 0) continue;

    const existing = tasksByUser.get(m.user_id) || [];
    existing.push(...listTasks);
    tasksByUser.set(m.user_id, existing);
  }

  for (const [userId, userTaskList] of Array.from(tasksByUser.entries())) {
    if (ctx.isTimeBudgetExhausted()) break;

    const prefs = ctx.userPreferencesMap.get(userId) || {};
    const dueRemindersEnabled =
      prefs.dueRemindersEnabled ?? prefs.due_reminders_enabled ?? true;
    if (!dueRemindersEnabled) continue;

    const dueLeadTimeMinutes = Number(
      prefs.dueLeadTimeMinutes ?? prefs.due_lead_time_minutes ?? 30
    );
    const userMaxDueMs = ctx.nowMs + dueLeadTimeMinutes * 60 * 1000;

    const uniqueTasks = Array.from(
      new Map(userTaskList.map((t: TaskDueItem) => [t.task_id, t])).values()
    );

    const candidateTasks = uniqueTasks.filter((t: TaskDueItem) => {
      const targetMs = new Date(t.target_date).getTime();
      return targetMs > ctx.nowMs && targetMs <= userMaxDueMs;
    });

    if (candidateTasks.length === 0) continue;

    const taskDedupKeys = candidateTasks.map(
      (t: TaskDueItem) => `${t.task_id}:${t.target_date}`
    );

    const { data: pastDispatches, error: dispError } = await ctx.supabaseAdmin
      .from("notification_dispatches")
      .select("dedup_key")
      .eq("user_id", userId)
      .eq("kind", "task_due")
      .in("dedup_key", taskDedupKeys);

    if (dispError) {
      console.error(`[notifications] Error querying dispatches for user ${userId}:`, dispError.message);
      ctx.errorsCount.value++;
      continue;
    }

    const alreadyDispatchedKeys = new Set(
      (pastDispatches || []).map((d) => d.dedup_key)
    );

    const qualifiedTasks = candidateTasks.filter(
      (t: TaskDueItem) => !alreadyDispatchedKeys.has(`${t.task_id}:${t.target_date}`)
    );

    if (qualifiedTasks.length === 0) continue;

    qualifiedTasks.sort(
      (a: TaskDueItem, b: TaskDueItem) =>
        new Date(a.target_date).getTime() - new Date(b.target_date).getTime()
    );

    const count = qualifiedTasks.length;
    const firstTask = qualifiedTasks[0];
    const firstTargetMs = new Date(firstTask.target_date).getTime();
    const minRemaining = Math.max(
      1,
      Math.round((firstTargetMs - ctx.nowMs) / 60000)
    );

    const message = buildTaskDueMessage(
      count,
      firstTask.task_content,
      minRemaining
    );

    const dedupKey = `${firstTask.task_id}:${firstTask.target_date}`;

    jobs.push({
      userId,
      kind: "task_due",
      dedupKey,
      title: message.title,
      body: message.body,
      url: "/alino-app",
      tag: "alino-task-due",
      ttl: 1800,
      urgency: "high",
      priority: 1,
    });
  }

  return jobs;
}
