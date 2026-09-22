import { SupabaseClient } from "@supabase/supabase-js";
import { AgentChatMessage } from "./types";

export interface ConversationRecord {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  userId: string,
  requestedId?: string | null
): Promise<string> {
  if (requestedId) {
    const { data } = await supabase
      .from("ai_conversations")
      .select("id")
      .eq("id", requestedId)
      .eq("user_id", userId)
      .maybeSingle();

    if (data?.id) {
      return data.id;
    }
  }

  const { data: newConv, error } = await supabase
    .from("ai_conversations")
    .insert({
      user_id: userId,
      title: "Nueva conversación",
    })
    .select("id")
    .single();

  if (error || !newConv) {
    console.error("[ChatPersistence] Error creating conversation:", error);
    return requestedId || "temp-session";
  }

  return newConv.id;
}

export async function getUserConversations(
  supabase: SupabaseClient,
  userId: string,
  page: number = 0,
  limit: number = 15
): Promise<{ conversations: ConversationRecord[]; hasMore: boolean }> {
  const from = page * limit;
  const to = from + limit;

  const { data, error } = await supabase
    .from("ai_conversations")
    .select("id, user_id, title, created_at, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { conversations: [], hasMore: false };
  }

  const hasMore = data.length > limit;
  const items = data.slice(0, limit);
  return { conversations: items as ConversationRecord[], hasMore };
}

export async function loadRecentMessages(
  supabase: SupabaseClient,
  conversationId: string,
  limit: number = 20
): Promise<AgentChatMessage[]> {
  const { data, error } = await supabase
    .from("ai_messages")
    .select("id, role, content, tool_calls, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) {
    return [];
  }

  return (data as AgentChatMessage[]).reverse();
}

export async function getPaginatedMessages(
  supabase: SupabaseClient,
  conversationId: string,
  beforeCreatedAt?: string | null,
  limit: number = 20
): Promise<{ messages: AgentChatMessage[]; hasMore: boolean }> {
  let query = supabase
    .from("ai_messages")
    .select("id, role, content, tool_calls, created_at")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: false })
    .limit(limit + 1);

  if (beforeCreatedAt) {
    query = query.lt("created_at", beforeCreatedAt);
  }

  const { data, error } = await query;
  if (error || !data) {
    return { messages: [], hasMore: false };
  }

  const hasMore = data.length > limit;
  const items = data.slice(0, limit).reverse();
  return { messages: items as AgentChatMessage[], hasMore };
}

export async function saveMessage(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
  message: {
    role: "user" | "assistant" | "system" | "tool";
    content: string;
    tool_calls?: unknown;
    tool_results?: unknown;
  }
) {
  try {
    await supabase.from("ai_messages").insert({
      conversation_id: conversationId,
      user_id: userId,
      role: message.role,
      content: message.content,
      tool_calls: message.tool_calls ?? null,
      tool_results: message.tool_results ?? null,
    });

    await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (err: unknown) {
    console.warn("[ChatPersistence] Warning saving message:", err);
  }
}

export async function updateConversationTitle(
  supabase: SupabaseClient,
  conversationId: string,
  title: string
) {
  try {
    await supabase
      .from("ai_conversations")
      .update({ title, updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  } catch (err: unknown) {
    console.warn("[ChatPersistence] Warning updating conversation title:", err);
  }
}

export async function clearConversationHistory(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
) {
  const { error } = await supabase
    .from("ai_messages")
    .delete()
    .eq("conversation_id", conversationId)
    .eq("user_id", userId);

  return { success: !error };
}

export async function deleteConversation(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string
) {
  const { error } = await supabase
    .from("ai_conversations")
    .delete()
    .eq("id", conversationId)
    .eq("user_id", userId);

  return { success: !error };
}
