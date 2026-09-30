import type { SupabaseClient } from "@supabase/supabase-js";

export type NotificationKind =
  | "task_due"
  | "streak_danger"
  | "daily_digest"
  | "engagement_nudge";

export interface PushSubscriptionItem {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export interface TaskDueItem {
  task_id: string;
  task_content: string;
  target_date: string;
  list_id: string;
}

export interface NotificationJob {
  userId: string;
  kind: NotificationKind;
  dedupKey: string;
  allDedupKeys?: string[];
  title: string;
  body: string;
  url: string;
  tag: string;
  ttl: number;
  urgency: "high" | "normal" | "low";
  priority: number;
}

export interface CollectorContext {
  supabaseAdmin: SupabaseClient;
  now: Date;
  nowMs: number;
  isTimeBudgetExhausted: () => boolean;
  subscribersMap: Map<string, PushSubscriptionItem[]>;
  userTimezonesMap: Map<string, string>;
  userPreferencesMap: Map<string, Record<string, any>>;
  errorsCount: { value: number };
}

export interface DispatchSummary {
  status: "success";
  timestamp: string;
  processedUsers: number;
  dispatchedCount: number;
  dueRemindersSent: number;
  dailyDigestsSent: number;
  streakDangerSent: number;
  engagementNudgesSent: number;
  errorsCount: number;
  timeBudgetExceeded: boolean;
  unprocessedUsersCount: number;
  durationMs: number;
}
