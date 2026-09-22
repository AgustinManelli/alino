import { z } from "zod";
import { AgentToolDefinition } from "../types";
import {
  insertList,
  updateDataList,
  updateIndexList,
  deleteList,
  insertFolder,
} from "@/lib/api/list/actions";
import { LexoRank } from "lexorank";
import { v4 as uuidv4 } from "uuid";
import { normalizeEmojiShortcode } from "@/lib/ai/sanitizeEmoji";

export const getListsTool: AgentToolDefinition = {
  name: "get_lists",
  description:
    "Retrieves all lists created or accessible by the user, including lists inside folders and root lists, with their names, colors, icons, folder assignments, and task counts.",
  parameters: z.object({
    folder_id: z.string().optional().describe("Optional filter to only get lists in a specific folder ID"),
    folder_name: z.string().optional().describe("Optional filter to only get lists in a specific folder name"),
  }),
  execute: async (params, context) => {
    const { data: foldersData } = await context.supabase
      .from("list_folders")
      .select("folder_id, folder_name, folder_color, pinned")
      .eq("user_id", context.userId)
      .order("index", { ascending: true });

    const folderMap = new Map<string, { folder_id: string; folder_name: string; folder_color: string | null }>();
    (foldersData || []).forEach((f: any) => folderMap.set(f.folder_id, f));

    let filterFolderId = params.folder_id;
    if (!filterFolderId && params.folder_name) {
      const match = (foldersData || []).find(
        (f: any) => f.folder_name.toLowerCase() === params.folder_name?.trim().toLowerCase()
      );
      if (match) {
        filterFolderId = match.folder_id;
      }
    }

    let query = context.supabase
      .from("list_memberships")
      .select(`
        list_id,
        folder,
        pinned,
        role,
        list:lists (
          list_id,
          list_name,
          color,
          icon,
          tasks(count)
        )
      `)
      .eq("user_id", context.userId);

    if (filterFolderId) {
      query = query.eq("folder", filterFolderId);
    }

    const { data: memberships, error } = await query;
    if (error) {
      return { error: error.message };
    }

    const lists = (memberships || []).map((m: any) => {
      const listData = Array.isArray(m.list) ? m.list[0] : m.list;
      const taskCount = listData?.tasks?.[0]?.count ?? 0;
      const parentFolder = m.folder ? folderMap.get(m.folder) : null;

      return {
        list_id: m.list_id,
        list_name: listData?.list_name ?? "Lista",
        color: listData?.color ?? "#87189d",
        icon: listData?.icon ?? null,
        folder_id: m.folder ?? null,
        folder_name: parentFolder?.folder_name ?? null,
        task_count: taskCount,
        pinned: m.pinned ?? false,
        role: m.role ?? "owner",
      };
    });

    return {
      total_lists: lists.length,
      lists,
      folders: (foldersData || []).map((f: any) => ({
        folder_id: f.folder_id,
        folder_name: f.folder_name,
        folder_color: f.folder_color,
        pinned: f.pinned ?? false,
      })),
    };
  },
};

export const createListTool: AgentToolDefinition = {
  name: "create_list",
  description:
    "Creates a new list for tasks, optionally inside a specific folder. Always choose an appropriate themed color from the Alino palette and a representative emoji icon for the list topic.",
  parameters: z.object({
    list_name: z.string().min(1).max(30).describe("Name of the list (1 to 30 characters)"),
    color: z
      .string()
      .default("#87189d")
      .describe(
        "Hex color code from the Alino palette (e.g. #0693e3, #ff6900, #7ed321, #87189d, #ff0048, #c800ff, #2ccce4, #ffae00)"
      ),
    icon: z
      .string()
      .optional()
      .nullable()
      .describe("Representative emoji string for the list theme (e.g. 💻, 🗄️, 📦, 📑, 🎓, 🛒, 🚀, 💡, 🏋️)"),
    folder_id: z.string().optional().nullable().describe("Optional UUID of the folder where this list will reside"),
    folder_name: z.string().optional().nullable().describe("Optional name of the destination folder if folder_id is not known"),
  }),
  execute: async (params, context) => {
    let targetFolderId = params.folder_id ?? null;

    if (!targetFolderId && params.folder_name) {
      const { data: matchedFolder } = await context.supabase
        .from("list_folders")
        .select("folder_id")
        .eq("user_id", context.userId)
        .ilike("folder_name", params.folder_name.trim())
        .limit(1)
        .maybeSingle();

      if (matchedFolder) {
        targetFolderId = matchedFolder.folder_id;
      }
    }

    const listId = uuidv4();
    const rank = LexoRank.middle().toString();

    const res = await insertList(
      listId,
      params.list_name,
      params.color,
      normalizeEmojiShortcode(params.icon),
      rank,
      0,
      targetFolderId
    );

    if (res?.error) {
      return { error: res.error };
    }

    return {
      success: true,
      message: `List "${params.list_name}" created successfully`,
      list: res?.data ?? { list_id: listId, list_name: params.list_name, folder_id: targetFolderId },
    };
  },
};

export const updateListTool: AgentToolDefinition = {
  name: "update_list",
  description: "Updates properties of an existing list (name, color, icon). Accepts list_id or list_name.",
  parameters: z.object({
    list_id: z.string().optional().describe("UUID of the list to update"),
    list_name: z.string().optional().describe("Current name of the list to find it if list_id is not known"),
    new_list_name: z.string().min(1).max(30).optional().describe("New name for the list"),
    color: z.string().optional().describe("New hex color code"),
    icon: z.string().optional().nullable().describe("Emoji or icon identifier"),
  }),
  execute: async (params, context) => {
    let resolvedListId = params.list_id;

    if (!resolvedListId && params.list_name) {
      const { data: member } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_name, color, icon)")
        .eq("user_id", context.userId);

      const found = (member || []).find(
        (m: any) => m.list?.list_name?.toLowerCase() === params.list_name?.toLowerCase()
      );
      if (found) {
        resolvedListId = found.list_id;
      }
    }

    if (!resolvedListId) {
      return { error: "No se encontró la lista a actualizar. Especifica un nombre o ID válido." };
    }

    const { data: currentList } = await context.supabase
      .from("lists")
      .select("list_name, color, icon")
      .eq("list_id", resolvedListId)
      .single();

    const finalName = params.new_list_name || currentList?.list_name || "Lista";
    const finalColor = params.color || currentList?.color || "#87189d";
    const finalIcon =
      params.icon !== undefined
        ? normalizeEmojiShortcode(params.icon)
        : currentList?.icon;

    const res = await updateDataList(
      resolvedListId,
      finalName,
      finalColor,
      finalIcon
    );

    if (res?.error) {
      return { error: res.error };
    }

    return {
      success: true,
      list: res?.data,
    };
  },
};

export const moveListToFolderTool: AgentToolDefinition = {
  name: "move_list_to_folder",
  description:
    "Moves a list into a folder or unassigns it to root level. Accepts list_id or list_name, and folder_id or folder_name.",
  parameters: z.object({
    list_id: z.string().optional().describe("UUID of the list to move"),
    list_name: z.string().optional().describe("Name of the list to move if ID is not known"),
    folder_id: z.string().optional().nullable().describe("UUID of destination folder, or null to move to root"),
    folder_name: z.string().optional().nullable().describe("Name of destination folder (or 'root' / 'raíz' for root) if ID is not known"),
  }),
  execute: async (params, context) => {
    let resolvedListId = params.list_id;
    let listTitle = params.list_name || "";

    if (!resolvedListId && params.list_name) {
      const { data: memberships } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId);

      const found = (memberships || []).find((m: any) => {
        const listData = Array.isArray(m.list) ? m.list[0] : m.list;
        return listData?.list_name?.trim().toLowerCase() === params.list_name?.trim().toLowerCase();
      });

      if (found) {
        const listData = Array.isArray(found.list) ? found.list[0] : found.list;
        resolvedListId = found.list_id;
        listTitle = listData?.list_name || listTitle;
      }
    }

    if (!resolvedListId) {
      return {
        error: `No se encontró la lista "${params.list_name || params.list_id}". Verifica el nombre o ID.`,
      };
    }

    let targetFolderId: string | null = params.folder_id !== undefined ? params.folder_id : null;
    let targetFolderName = "la raíz";

    if (params.folder_name) {
      const fn = params.folder_name.trim().toLowerCase();
      if (fn === "root" || fn === "raíz" || fn === "raiz" || fn === "ninguna" || fn === "sin carpeta") {
        targetFolderId = null;
        targetFolderName = "la raíz";
      } else {
        const { data: existingFolder } = await context.supabase
          .from("list_folders")
          .select("folder_id, folder_name")
          .eq("user_id", context.userId)
          .ilike("folder_name", params.folder_name.trim())
          .limit(1)
          .maybeSingle();

        if (existingFolder) {
          targetFolderId = existingFolder.folder_id;
          targetFolderName = `la carpeta "${existingFolder.folder_name}"`;
        } else {
          const newFolderId = uuidv4();
          const folderRank = LexoRank.middle().toString();
          await insertFolder(
            newFolderId,
            params.folder_name.trim(),
            "#87189d",
            0,
            folderRank
          );
          targetFolderId = newFolderId;
          targetFolderName = `la nueva carpeta "${params.folder_name.trim()}"`;
        }
      }
    }

    let rank = LexoRank.middle().toString();
    try {
      let query = context.supabase
        .from("list_memberships")
        .select("rank")
        .eq("user_id", context.userId);

      if (targetFolderId) {
        query = query.eq("folder", targetFolderId);
      } else {
        query = query.is("folder", null);
      }

      const { data: siblings } = await query.order("rank", { ascending: false }).limit(1);
      if (siblings && siblings.length > 0 && siblings[0].rank) {
        rank = LexoRank.parse(siblings[0].rank).genNext().toString();
      }
    } catch {
      rank = LexoRank.middle().toString();
    }

    const res = await updateIndexList(resolvedListId, targetFolderId, rank);

    if (res?.error) {
      return { error: res.error };
    }

    return {
      success: true,
      message: `Lista "${listTitle || resolvedListId}" movida exitosamente a ${targetFolderName}.`,
      list_id: resolvedListId,
      folder_id: targetFolderId,
    };
  },
};

export const deleteListTool: AgentToolDefinition = {
  name: "delete_list",
  description: "Permanently deletes a list and all tasks contained within it. Accepts list_id or list_name.",
  isDestructive: true,
  parameters: z.object({
    list_id: z.string().optional().describe("UUID of the list to delete"),
    list_name: z.string().optional().describe("Name of the list to delete if ID is not known"),
  }),
  execute: async (params, context) => {
    let resolvedListId = params.list_id;

    if (!resolvedListId && params.list_name) {
      const { data: memberships } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId);

      const found = (memberships || []).find((m: any) => {
        const listData = Array.isArray(m.list) ? m.list[0] : m.list;
        return listData?.list_name?.trim().toLowerCase() === params.list_name?.trim().toLowerCase();
      });
      if (found) {
        resolvedListId = found.list_id;
      }
    }

    if (!resolvedListId) {
      return { error: "No se encontró la lista a eliminar." };
    }

    const res = await deleteList(resolvedListId);
    if (res?.error) {
      return { error: res.error };
    }

    return {
      success: true,
      message: "List deleted successfully",
      list_id: resolvedListId,
    };
  },
};

export const deleteAllListsTool: AgentToolDefinition = {
  name: "delete_all_lists",
  description:
    "Permanently deletes ALL task lists owned by the user (and cascades to all their tasks). Use when the user asks to 'elimina las listas', 'borra todas las listas', or delete all lists.",
  isDestructive: true,
  parameters: z.object({}),
  execute: async (_, context) => {
    const { data: userMemberships } = await context.supabase
      .from("list_memberships")
      .select("list_id")
      .eq("user_id", context.userId)
      .eq("role", "owner");

    const ownedListIds = (userMemberships || []).map((m: any) => m.list_id);

    if (ownedListIds.length === 0) {
      return { success: true, message: "No tienes listas para eliminar.", deleted_count: 0 };
    }

    const { data: deleted, error } = await context.supabase
      .from("lists")
      .delete()
      .in("list_id", ownedListIds)
      .select("list_id");

    if (error) {
      return { error: error.message };
    }

    const count = deleted?.length ?? 0;
    return {
      success: true,
      message: `Se eliminaron exitosamente todas tus listas (${count} lista(s)) y sus tareas asociadas.`,
      deleted_count: count,
    };
  },
};

export const deleteWorkspaceDataTool: AgentToolDefinition = {
  name: "delete_workspace_data",
  description:
    "Permanently wipes ALL user data in Alino: all folders, all lists, and all tasks. Use when the user asks to 'elimina todo', 'borra todo', 'eliminar todo (listas, tareas, carpetas)' or wipe their entire workspace.",
  isDestructive: true,
  parameters: z.object({
    confirm_all: z.boolean().default(true).describe("Set to true to confirm wiping all workspace data"),
  }),
  execute: async (_, context) => {
    const { data: userFolders } = await context.supabase
      .from("list_folders")
      .select("folder_id")
      .eq("user_id", context.userId);
    const folderIds = (userFolders || []).map((f: any) => f.folder_id);

    const { data: userMemberships } = await context.supabase
      .from("list_memberships")
      .select("list_id, role")
      .eq("user_id", context.userId);

    const ownedListIds = (userMemberships || [])
      .filter((m: any) => m.role === "owner")
      .map((m: any) => m.list_id);
    const allListIds = (userMemberships || []).map((m: any) => m.list_id);

    let deletedTasksCount = 0;
    if (allListIds.length > 0) {
      const { data: deletedTasks } = await context.supabase
        .from("tasks")
        .delete()
        .in("list_id", allListIds)
        .select("task_id");
      deletedTasksCount = deletedTasks?.length ?? 0;
    }

    let deletedListsCount = 0;
    if (ownedListIds.length > 0) {
      const { data: deletedLists } = await context.supabase
        .from("lists")
        .delete()
        .in("list_id", ownedListIds)
        .select("list_id");
      deletedListsCount = deletedLists?.length ?? 0;
    }

    let deletedFoldersCount = 0;
    if (folderIds.length > 0) {
      const { data: deletedFolders } = await context.supabase
        .from("list_folders")
        .delete()
        .in("folder_id", folderIds)
        .select("folder_id");
      deletedFoldersCount = deletedFolders?.length ?? 0;
    }

    return {
      success: true,
      message: `Se eliminó todo exitosamente: ${deletedFoldersCount} carpeta(s), ${deletedListsCount} lista(s) y ${deletedTasksCount} tarea(s). Tu espacio quedó completamente limpio.`,
      deleted_folders: deletedFoldersCount,
      deleted_lists: deletedListsCount,
      deleted_tasks: deletedTasksCount,
    };
  },
};

export const listsTools: AgentToolDefinition[] = [
  getListsTool,
  createListTool,
  updateListTool,
  moveListToFolderTool,
  deleteListTool,
  deleteAllListsTool,
  deleteWorkspaceDataTool,
];
