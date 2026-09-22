import { z } from "zod";
import { AgentToolDefinition } from "../types";
import {
  insertFolder,
  updateDataFolder,
  deleteFolder,
  deleteFolderWithContents,
} from "@/lib/api/list/actions";
import { LexoRank } from "lexorank";
import { v4 as uuidv4 } from "uuid";

export const getFoldersTool: AgentToolDefinition = {
  name: "get_folders",
  description:
    "Retrieves all folders created by the user, including all lists and task counts inside each folder.",
  parameters: z.object({}),
  execute: async (_, context) => {
    const { data: folders, error } = await context.supabase
      .from("list_folders")
      .select("folder_id, folder_name, folder_color, folder_description, pinned, created_at")
      .eq("user_id", context.userId)
      .order("index", { ascending: true });

    if (error) {
      return { error: error.message };
    }

    const { data: memberships } = await context.supabase
      .from("list_memberships")
      .select(`
        list_id,
        folder,
        list:lists (
          list_id,
          list_name,
          color,
          icon,
          tasks(count)
        )
      `)
      .eq("user_id", context.userId);

    const foldersWithLists = (folders || []).map((f) => {
      const childMemberships = (memberships || []).filter((m: any) => m.folder === f.folder_id);
      const childLists = childMemberships.map((m: any) => {
        const listData = Array.isArray(m.list) ? m.list[0] : m.list;
        const taskCount = listData?.tasks?.[0]?.count ?? 0;
        return {
          list_id: m.list_id,
          list_name: listData?.list_name ?? "Lista",
          color: listData?.color,
          icon: listData?.icon,
          task_count: taskCount,
        };
      });

      const totalTasks = childLists.reduce((acc: number, curr: any) => acc + (curr.task_count || 0), 0);

      return {
        folder_id: f.folder_id,
        folder_name: f.folder_name,
        folder_color: f.folder_color,
        folder_description: f.folder_description,
        pinned: f.pinned ?? false,
        lists_count: childLists.length,
        total_tasks: totalTasks,
        lists: childLists,
      };
    });

    return {
      count: foldersWithLists.length,
      folders: foldersWithLists,
    };
  },
};

export const createFolderTool: AgentToolDefinition = {
  name: "create_folder",
  description:
    "Creates a new folder to organize related task lists together. Always choose an appropriate themed color from the Alino palette.",
  parameters: z.object({
    folder_name: z.string().min(1).max(30).describe("Name of the folder (1 to 30 characters)"),
    folder_color: z
      .string()
      .default("#87189d")
      .describe(
        "Hex color code from the Alino palette fitting the folder theme (e.g. #0693e3 for study/tech, #ff6900 for moving/home, #7ed321 for finance/health, #87189d for general/purple, #ff0048 for urgent)"
      ),
  }),
  execute: async (params) => {
    const folderId = uuidv4();
    const rank = LexoRank.middle().toString();
    const res = await insertFolder(
      folderId,
      params.folder_name,
      params.folder_color,
      0,
      rank
    );

    if (res?.error) {
      return { error: res.error };
    }

    return {
      success: true,
      message: `Folder "${params.folder_name}" created successfully`,
      folder: res?.data ?? { folder_id: folderId, folder_name: params.folder_name },
    };
  },
};

export const updateFolderTool: AgentToolDefinition = {
  name: "update_folder",
  description: "Updates folder properties (name, color).",
  parameters: z.object({
    folder_id: z.string().uuid().describe("UUID of the folder to update"),
    folder_name: z.string().min(1).max(30).describe("New folder name"),
    folder_color: z.string().default("#87189d").describe("New hex color"),
  }),
  execute: async (params) => {
    const res = await updateDataFolder(
      params.folder_id,
      params.folder_name,
      params.folder_color
    );

    if (res?.error) {
      return { error: res.error };
    }

    return {
      success: true,
      folder: res?.data,
    };
  },
};

export const moveFolderListsToRootTool: AgentToolDefinition = {
  name: "move_folder_lists_to_root",
  description:
    "Extracts/moves all lists (and all their tasks) out of a folder to root level without deleting any lists or tasks. Use this when the user asks to empty a folder or remove all tasks/lists from it.",
  parameters: z.object({
    folder_id: z.string().optional().describe("UUID of the folder to extract contents from"),
    folder_name: z.string().optional().describe("Name of the folder if UUID is not known"),
  }),
  execute: async (params, context) => {
    let folderId = params.folder_id;
    let folderName = params.folder_name || "";

    if (!folderId && params.folder_name) {
      const { data: matched } = await context.supabase
        .from("list_folders")
        .select("folder_id, folder_name")
        .eq("user_id", context.userId)
        .ilike("folder_name", params.folder_name.trim())
        .limit(1)
        .maybeSingle();

      if (matched) {
        folderId = matched.folder_id;
        folderName = matched.folder_name;
      }
    }

    if (!folderId) {
      return { error: `No se encontró la carpeta "${params.folder_name || params.folder_id}".` };
    }

    const { data: currentMemberships } = await context.supabase
      .from("list_memberships")
      .select("list_id, list:lists(list_name)")
      .eq("folder", folderId)
      .eq("user_id", context.userId);

    const { error } = await context.supabase
      .from("list_memberships")
      .update({ folder: null })
      .eq("folder", folderId)
      .eq("user_id", context.userId);

    if (error) {
      return { error: error.message };
    }

    const movedLists = (currentMemberships || []).map((m: any) => {
      const listData = Array.isArray(m.list) ? m.list[0] : m.list;
      return listData?.list_name ?? m.list_id;
    });

    return {
      success: true,
      message: `Se sacaron ${movedLists.length} lista(s) de la carpeta "${folderName || folderId}" a la raíz: ${movedLists.join(", ") || "ninguna"}. Sus tareas siguen intactas.`,
      moved_lists_count: movedLists.length,
      moved_lists: movedLists,
    };
  },
};

export const deleteFolderTool: AgentToolDefinition = {
  name: "delete_folder",
  description:
    "Deletes a folder. By default (delete_contents=false), it extracts and preserves all lists and tasks by moving them to root level. If delete_contents=true, it permanently removes the folder AND all its contained lists and tasks.",
  isDestructive: true,
  parameters: z.object({
    folder_id: z.string().optional().describe("UUID of the folder to delete"),
    folder_name: z.string().optional().describe("Name of the folder to delete if UUID is not known"),
    delete_contents: z
      .boolean()
      .default(false)
      .describe(
        "If true, permanently deletes all lists and tasks inside. If false (default and recommended), preserves lists and tasks by moving them to root level."
      ),
  }),
  execute: async (params, context) => {
    let folderId = params.folder_id;
    let folderName = params.folder_name || "";

    if (!folderId && params.folder_name) {
      const { data: matched } = await context.supabase
        .from("list_folders")
        .select("folder_id, folder_name")
        .eq("user_id", context.userId)
        .ilike("folder_name", params.folder_name.trim())
        .limit(1)
        .maybeSingle();

      if (matched) {
        folderId = matched.folder_id;
        folderName = matched.folder_name;
      }
    }

    if (!folderId) {
      return { error: `No se encontró la carpeta "${params.folder_name || params.folder_id}".` };
    }

    if (params.delete_contents) {
      const { data: listsInFolder } = await context.supabase
        .from("list_memberships")
        .select("list_id")
        .eq("folder", folderId)
        .eq("user_id", context.userId);

      const listIds = (listsInFolder || []).map((l: any) => l.list_id);
      const res = await deleteFolderWithContents(folderId, listIds);
      if (res?.error) return { error: res.error };
      return {
        success: true,
        message: `Carpeta "${folderName || folderId}" y todo su contenido eliminados permanentemente.`,
      };
    } else {
      await context.supabase
        .from("list_memberships")
        .update({ folder: null })
        .eq("folder", folderId)
        .eq("user_id", context.userId);

      const res = await deleteFolder(folderId);
      if (res?.error) return { error: res.error };
      return {
        success: true,
        message: `Carpeta "${folderName || folderId}" eliminada correctamente. Todas sus listas y tareas fueron preservadas y movidas a la raíz.`,
      };
    }
  },
};

export const foldersTools: AgentToolDefinition[] = [
  getFoldersTool,
  createFolderTool,
  updateFolderTool,
  moveFolderListsToRootTool,
  deleteFolderTool,
];
