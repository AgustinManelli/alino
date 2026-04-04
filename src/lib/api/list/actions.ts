"use server";

import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";
import {
  FolderType,
  ListsType,
  MembershipCountPayload,
  TaskCountPayload,
  UserWithMembershipRole,
} from "@/lib/schemas/database.types";

const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed";
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

interface AuthClient {
  supabase: SupabaseClient;
  user: User;
}

const getAuthenticatedSupabaseClient = async (): Promise<AuthClient> => {
  const supabase = createClientServer();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getUser();

  if (sessionError || !sessionData.user) {
    throw new Error(AUTH_ERROR_MESSAGE);
  } else {
    return { supabase, user: sessionData.user };
  }
};

interface SidebarListPayload {
  folder: string | null;
  index: number;
  list_id: string;
  pinned: boolean;
  rank: string | null;
  role: string;
  shared_by: string | null;
  shared_since: string;
  updated_at: string | null;
  user_id: string;
  list: {
    list_id: string;
    list_name: string;
    color: string;
    icon: string | null;
    owner_id: string;
    is_shared: boolean;
    non_owner_count?: number;
    created_at?: string;
    updated_at?: string | null;
    description?: string | null;
    tasks?: TaskCountPayload;
  };
}

interface SidebarFolderPayload {
  folder_id: string;
  folder_name: string;
  folder_color: string | null;
  folder_description: string | null;
  user_id: string;
  updated_at: string | null;
  created_at: string;
  index: number;
  rank: string | null;
  memberships: MembershipCountPayload;
  max_rank: string | null;
}

interface SidebarRpcRow {
  item_id: string;
  item_type: "folder" | "list";
  item_rank: string | null;
  payload: SidebarListPayload | SidebarFolderPayload;
}

export async function getSingleLists(list_id: string) {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data: listData, error: listsError } = await supabase
      .from("lists")
      .select("*")
      .eq("list_id", list_id)
      .single();

    if (listsError) {
      throw new Error(
        "No se pudo obtener la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    if (!listData) {
      return { data: null };
    }

    return { data: listData };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}

export async function getLists(): Promise<{
  data?: {
    lists: ListsType[];
    tasks: never[];
    folders: FolderType[];
    hasMoreRoot: boolean;
  };
  error?: string;
}> {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: pinnedData, error: pinnedError } = await supabase
      .from("list_memberships")
      .select(`*, list: lists (*, tasks(count))`)
      .eq("user_id", user.id)
      .eq("pinned", true)
      .order("rank", { ascending: true });

    if (pinnedError) {
      throw new Error("No se pudieron obtener las listas fijadas.");
    }

    const { data: mixedData, error: mixedError } = await supabase
      .rpc("get_paginated_sidebar", {
        p_user_id: user.id,
        p_page_limit: 200,
        p_offset: 0,
      });

    if (mixedError) {
      throw new Error(
        "No se pudo inicializar la barra lateral. Intentalo nuevamente."
      );
    }

    const rows = (mixedData ?? []) as SidebarRpcRow[];

    const folders: FolderType[] = [];
    const unpinnedLists: ListsType[] = [];

    rows.forEach((item) => {
      if (item.item_type === "folder") {
        const p = item.payload as SidebarFolderPayload;
        folders.push({
          folder_id: p.folder_id,
          folder_name: p.folder_name,
          folder_color: p.folder_color,
          folder_description: p.folder_description,
          user_id: p.user_id,
          updated_at: p.updated_at,
          created_at: p.created_at,
          index: p.index,
          rank: p.rank,
          memberships: p.memberships ?? [{ count: 0 }],
        });
      } else if (item.item_type === "list") {
        unpinnedLists.push(item.payload as ListsType);
      }
    });

    const LIMIT = 200;

    return {
      data: {
        lists: [...(pinnedData as ListsType[] ?? []), ...unpinnedLists],
        tasks: [],
        folders,
        hasMoreRoot: rows.length >= LIMIT,
      },
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}

export const getPaginatedLists = async (
  folderId: string | null = null,
  page: number = 0,
  limit: number = 200
): Promise<{ data?: (ListsType | FolderType)[]; error?: string }> => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const from = page * limit;

    if (folderId) {
      const { data: qData, error } = await supabase
        .from("list_memberships")
        .select(`*, list: lists (*, tasks(count))`)
        .eq("user_id", user.id)
        .order("rank", { ascending: true })
        .range(from, from + limit - 1)
        .eq("folder", folderId);

      if (error) throw new Error("No se pudieron cargar las listas.");
      return { data: (qData as ListsType[]) ?? [] };
    } else {
      const { data: mixData, error } = await supabase.rpc(
        "get_paginated_sidebar",
        {
          p_user_id: user.id,
          p_page_limit: limit,
          p_offset: from,
        }
      );

      if (error) throw new Error("No se pudo cargar la barra lateral.");

      const rows = (mixData ?? []) as SidebarRpcRow[];
      const items: (ListsType | FolderType)[] = rows.map((item) => {
        if (item.item_type === "folder") {
          const p = item.payload as SidebarFolderPayload;
          const folder: FolderType = {
            folder_id: p.folder_id,
            folder_name: p.folder_name,
            folder_color: p.folder_color,
            folder_description: p.folder_description,
            user_id: p.user_id,
            updated_at: p.updated_at,
            created_at: p.created_at,
            index: p.index,
            rank: p.rank,
            memberships: p.memberships ?? [{ count: 0 }],
          };
          return Object.assign(folder, { _item_type: "folder" as const });
        } else {
          return Object.assign(item.payload as ListsType, {
            _item_type: "list" as const,
          });
        }
      });

      return { data: items };
    }
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateIndexList = async (
  list_id: string,
  folder_id: string | null,
  rank: string
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("list_memberships")
      .update({ folder: folder_id, rank: rank })
      .eq("list_id", list_id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        "No se pudo actualizar la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateIndexFolder = async (folder_id: string, rank: string) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("list_folders")
      .update({ rank })
      .eq("folder_id", folder_id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        "No se pudo actualizar la carpeta. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const insertList = async (
  list_id: string,
  list_name: string,
  color: string | null,
  icon: string | null,
  rank: string,
  index: number
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc(
      "create_list_and_owner_membership",
      {
        p_list_id: list_id,
        p_list_name: list_name,
        p_color: color,
        p_icon: icon,
        p_rank: rank,
        p_index: index,
      }
    );

    if (error) {
      throw new Error(
        "No se pudo insertar la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: data ?? null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const insertFolder = async (
  folder_id: string,
  folder_name: string,
  folder_color: string | null,
  index: number,
  rank: string
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.from("list_folders").insert({
      folder_id,
      user_id: user.id,
      folder_name,
      folder_color,
      index,
      rank,
    });

    if (error) {
      throw new Error(
        "No se pudo insertar la carpeta. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: data ?? null };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteList = async (list_id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { error } = await supabase
      .from("lists")
      .delete()
      .eq("list_id", list_id);

    if (error) {
      throw new Error(
        "No se pudo eliminar la lista. Intentalo nuevamente o contacta con soporte."
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteFolder = async (folder_id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { error } = await supabase
      .from("list_folders")
      .delete()
      .eq("folder_id", folder_id);

    if (error) {
      throw new Error(
        "No se pudo eliminar la carpeta. Intentalo nuevamente o contacta con soporte."
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const leaveList = async (list_id: string) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { error } = await supabase
      .from("list_memberships")
      .delete()
      .eq("list_id", list_id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        "No se pudo salir de la lista. Intentalo nuevamente o contacta con soporte."
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateDataList = async (
  list_id: string,
  list_name: string,
  color: string,
  icon: string | null
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("lists")
      .update({
        list_name,
        color,
        icon,
      })
      .eq("list_id", list_id);

    if (error) {
      throw new Error(
        "No se pudo actualizar la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateDataFolder = async (
  folder_id: string,
  folder_name: string,
  folder_color: string | null
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("list_folders")
      .update({
        folder_name,
        folder_color,
      })
      .eq("folder_id", folder_id);

    if (error) {
      throw new Error(
        "No se pudo actualizar la carpeta. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updatePinnedList = async (
  list_id: string,
  pinned: boolean,
  index: number | null
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const updatePayload = pinned
      ? { pinned, folder: null as string | null }
      : { pinned, index: index ?? undefined };

    const { data, error } = await supabase
      .from("list_memberships")
      .update(updatePayload)
      .eq("list_id", list_id)
      .eq("user_id", user.id)
      .select();

    if (error) {
      throw new Error(
        "No se pudo actualizar la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0].message };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteAllLists = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("lists")
      .delete()
      .eq("owner_id", user.id);

    if (error) {
      throw new Error("Failed to delete all lists. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const getUsersMembersList = async (
  list_id: string
): Promise<{ data?: UserWithMembershipRole[]; error?: string }> => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("get_list_members_users", {
      p_list_id: list_id,
    });

    if (error) {
      throw new Error(
        `No se pudo obtener los miembros de la lista. Intentalo nuevamente o contacta con soporte. ${error.message}`
      );
    }

    return { data: data as UserWithMembershipRole[] };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const createListInvitation = async (
  list_id: string,
  invited_user_username: string
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc(
      "create_list_invitation_by_username",
      {
        p_list_id: list_id,
        p_invited_username: invited_user_username,
      }
    );

    if (error) {
      const errorMsg = error.message || "";
      if (errorMsg.includes("Acceso no autorizado") || error.code === "UNATH") {
        return {
          error:
            "Acceso no autorizado. Inténtalo nuevamente o contacta con soporte.",
        };
      }
      if (
        errorMsg.includes("usuario no fue encontrado") ||
        error.code === "USRNF"
      ) {
        return { error: "El usuario ingresado no fue encontrado." };
      }
      if (
        errorMsg.includes("No tenés permiso") ||
        error.code === "FRBDN"
      ) {
        return {
          error: "No tienes permisos para invitar usuarios a esta lista.",
        };
      }
      if (
        errorMsg.includes("No puedes invitarte a ti mismo") ||
        error.code === "SLFIV"
      ) {
        return { error: "No puedes invitarte a ti mismo." };
      }
      if (errorMsg.includes("ya es miembro") || error.code === "ALRDM") {
        return { error: "El usuario ya es miembro de la lista." };
      }
      if (
        errorMsg.includes("invitación pendiente") ||
        error.code === "INVPD"
      ) {
        return {
          error: "Ya existe una invitación pendiente para este usuario.",
        };
      }
      if (errorMsg.includes("lista no existe") || error.code === "LSTNF") {
        return { error: "La lista no existe o hubo un error inesperado." };
      }
      return {
        error: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
      };
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return {
      error: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
    };
  }
};