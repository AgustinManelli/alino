export interface ProfileStats {
  changes_this_month: number;
  last_username_change: string | null;
  max_changes_per_month: number;
  remaining_changes: number;
}

export type SubscriptionTier = "free" | "student" | "pro" | "ultra";

export interface ActiveSubscription {
  id?: string;
  tier: SubscriptionTier;
  status:
    | "free"
    | "active"
    | "trialing"
    | "canceled"
    | "past_due"
    | "incomplete";
  gateway?: string;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
}

export interface FeatureUsage {
  used: number;
  limit: number;
  remaining: number;
  period_end: string;
  tier: string;
}

export interface UserSearchResult {
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
}

