import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";

export interface UserProfileContext {
  display_name: string;
  username: string;
  level: number;
  biography?: string | null;
  timezone?: string | null;
  tier: string;
  subscription_status?: string;
  period_end?: string | null;
}

export interface AgentToolContext {
  supabase: SupabaseClient;
  user: User;
  userId: string;
  userProfile?: UserProfileContext;
}

export interface AgentToolDefinition<TParams = any, TResult = any> {
  name: string;
  description: string;
  parameters: z.ZodType<TParams>;
  isDestructive?: boolean;
  execute: (params: TParams, context: AgentToolContext) => Promise<TResult>;
}

export type AgentRole = "user" | "assistant" | "system" | "tool";

export interface AgentChatMessage {
  id?: string;
  role: AgentRole;
  content: string;
  tool_calls?: {
    id: string;
    type: "function";
    function: {
      name: string;
      arguments: string;
    };
  }[];
  tool_call_id?: string;
  name?: string;
  created_at?: string;
}

export interface PendingConfirmationAction {
  id: string;
  toolName: string;
  params: Record<string, unknown>;
  description: string;
}

export interface AgentExecutionResult {
  message: string;
  conversationTitle?: string;
  toolCallsExecuted: {
    toolName: string;
    params: Record<string, unknown>;
    result: unknown;
  }[];
  requiresConfirmation?: PendingConfirmationAction;
  creditsUsed: number;
  remainingCredits?: number;
  conversationId: string;
}
