"use server";

import { createClient } from "@/utils/supabase/server";
import { UserWidgetRow, Json } from "@/lib/schemas/database.types";

const getAuth = async () => {
  const supabase = createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("Not authenticated");
  return { supabase, user: data.user };
};

export async function getUserEmbeddedWidgets(): Promise<{
  data?: UserWidgetRow[];
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase
      .from("user_widgets")
      .select("*")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { data: data ?? [] };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function getCommunityWidgets(): Promise<{
  data?: UserWidgetRow[];
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase
      .from("user_widgets")
      .select("*")
      .eq("is_public", true)
      // .neq("user_id", user.id)
      .eq("is_active", true)
      .in("moderation_status", ["approved", "auto_approved"])
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw new Error(error.message);
    return { data: data ?? [] };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function createEmbeddedWidget(payload: {
  title: string;
  url: string;
  config?: Json;
}): Promise<{ data?: UserWidgetRow; error?: string }> {
  try {
    const { supabase } = await getAuth();
    const { data, error } = await supabase.rpc("create_embedded_widget", {
      p_title:  payload.title,
      p_url:    payload.url,
      p_config: payload.config ?? {},
    });
    if (error) {
      if (error.message.includes("LIMIT")) {
        throw new Error("Límite de widgets embebidos alcanzado para tu plan.");
      }
      if (error.message.includes("VLDTN")) {
        throw new Error("Título o URL inválidos.");
      }
      throw new Error(error.message);
    }
    return { data: data as UserWidgetRow };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function updateEmbeddedWidget(
  id: string,
  payload: { title?: string; url?: string; config?: Json }
): Promise<{ data?: UserWidgetRow; error?: string }> {
  try {
    const { supabase, user } = await getAuth();
    const update: Partial<UserWidgetRow> = {};
    if (payload.title !== undefined) update.title = payload.title.trim();
    if (payload.url   !== undefined) update.url   = payload.url.trim();
    if (payload.config !== undefined) update.config = payload.config as UserWidgetRow["config"];
    
    const { data, error } = await supabase
      .from("user_widgets")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function deleteEmbeddedWidget(id: string): Promise<{ error?: string }> {
  try {
    const { supabase, user } = await getAuth();
    const { error } = await supabase
      .from("user_widgets")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);
    if (error) throw new Error(error.message);
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}

export async function toggleWidgetPublic(
  id: string,
  isPublic: boolean
): Promise<{ data?: UserWidgetRow; error?: string }> {
  try {
    const { supabase, user } = await getAuth();
    const { data, error } = await supabase
      .from("user_widgets")
      .update({ is_public: isPublic })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { data };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Error desconocido." };
  }
}