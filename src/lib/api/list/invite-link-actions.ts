"use server";
import { createClient as createClientServer } from "@/utils/supabase/server";

const UNKNOWN_ERROR = "An unknown error occurred.";

export type InviteLink = {
  id: string;
  token: string;
  role: "admin" | "editor" | "reader";
  is_active: boolean;
  max_uses: number | null;
  used_count: number;
  expires_at: string | null;
  created_at: string;
};

export type InviteLinkInfo = {
  valid: boolean;
  reason?: "not_found" | "revoked" | "expired" | "max_uses";
  list_id?: string;
  list_name?: string;
  role?: string;
  used_count?: number;
  max_uses?: number | null;
};

export async function createInviteLink(
  list_id: string,
  role: "admin" | "editor" | "reader",
  max_uses: number | null = null,
  expires_at: string | null = null
): Promise<{ data?: InviteLink; error?: string }> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase.rpc("create_list_invite_link", {
      p_list_id:    list_id,
      p_role:       role,
      p_max_uses:   max_uses,
      p_expires_at: expires_at,
    });
    if (error) {
      if (error.code === "FRBDN") return { error: "No tienes permisos para crear enlaces." };
      if (error.code === "INVRL") return { error: "Rol inválido." };
      throw new Error(error.message);
    }
    return { data: data as InviteLink };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function getInviteLinks(
  list_id: string
): Promise<{ data?: InviteLink[]; error?: string }> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase.rpc("get_list_invite_links", {
      p_list_id: list_id,
    });
    if (error) {
      if (error.code === "FRBDN") return { error: "Sin permisos." };
      throw new Error(error.message);
    }
    return { data: (data ?? []) as InviteLink[] };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function revokeInviteLink(
  link_id: string
): Promise<{ error?: string }> {
  try {
    const supabase = createClientServer();
    const { error } = await supabase.rpc("revoke_list_invite_link", {
      p_link_id: link_id,
    });
    if (error) {
      if (error.code === "FRBDN") return { error: "No tienes permisos." };
      if (error.code === "LNKNF") return { error: "El enlace no existe." };
      throw new Error(error.message);
    }
    return {};
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function getInviteLinkInfo(
  token: string
): Promise<{ data?: InviteLinkInfo; error?: string }> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase.rpc("get_invite_link_info", {
      p_token: token,
    });
    if (error) throw new Error(error.message);
    return { data: data as InviteLinkInfo };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}

export async function useInviteLink(
  token: string
): Promise<{ data?: { status: string; list_id: string; role?: string }; error?: string }> {
  try {
    const supabase = createClientServer();
    const { data, error } = await supabase.rpc("use_list_invite_link", {
      p_token: token,
    });
    if (error) {
      if (error.code === "UNATH") return { error: "Debes iniciar sesión." };
      if (error.code === "LNKNF") return { error: "El enlace no existe o fue desactivado." };
      if (error.code === "LNKEX") return { error: "Este enlace ha expirado." };
      if (error.code === "LNKMU") return { error: "Este enlace ha alcanzado su límite de usos." };
      throw new Error(error.message);
    }
    return { data };
  } catch (e: unknown) {
    return { error: e instanceof Error ? e.message : UNKNOWN_ERROR };
  }
}