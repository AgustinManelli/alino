import { z } from "zod";
import { AgentToolDefinition } from "../types";
import { LexoRank } from "lexorank";
import { v4 as uuidv4 } from "uuid";
import { normalizeEmojiShortcode } from "@/lib/ai/sanitizeEmoji";

interface HierarchyTaskInput {
  task_content: string;
  target_date?: string | null;
  description?: string | null;
}

interface HierarchyListInput {
  list_name: string;
  color?: string;
  icon?: string | null;
  tasks?: HierarchyTaskInput[];
}

interface HierarchyFolderInput {
  folder_name: string;
  folder_color?: string;
  lists?: HierarchyListInput[];
}

interface PreparedTask {
  task_id: string;
  task_content: string;
  target_date: string | null;
  completed: boolean;
  rank: string;
  index: number;
  description: string | null;
}

interface PreparedList {
  list_id: string;
  list_name: string;
  color: string;
  icon: string | null;
  rank: string;
  index: number;
  tasks: PreparedTask[];
}

interface PreparedFolder {
  folder_id: string;
  folder_name: string;
  folder_color: string;
  rank: string;
  index: number;
  lists: PreparedList[];
}

export const createWorkspaceHierarchyTool: AgentToolDefinition = {
  name: "create_workspace_hierarchy",
  description:
    "Creates multiple folders, lists, and tasks all in a single atomic batch operation. ALWAYS use this tool when the user requests creating multiple folders, multiple lists, or a complete project structure with tasks, instead of calling individual creation tools.",
  parameters: z.object({
    folders: z
      .array(
        z.object({
          folder_name: z.string().min(1).max(30).describe("Name of the folder"),
          folder_color: z
            .string()
            .default("#87189d")
            .describe("Hex color code for the folder from Alino palette (e.g. #0693e3, #ff6900, #7ed321, #87189d)"),
          lists: z
            .array(
              z.object({
                list_name: z.string().min(1).max(30).describe("Name of the list"),
                color: z
                  .string()
                  .default("#87189d")
                  .describe("Hex color code for the list badge"),
                icon: z
                  .string()
                  .optional()
                  .nullable()
                  .describe("Emoji shortcode for the list (e.g. :rocket:, :computer:, :mortar_board:, :books:, :muscle:, :house:, :page_facing_up:, :moneybag:) or null"),
                tasks: z
                  .array(
                    z.object({
                      task_content: z.string().min(1).max(2000).describe("Title or content of the task"),
                      target_date: z
                        .string()
                        .optional()
                        .nullable()
                        .describe("ISO 8601 due date/time with realistic hours in user's timezone"),
                      description: z.string().max(255).optional().nullable().describe("Optional note/details"),
                    })
                  )
                  .default([]),
              })
            )
            .default([]),
        })
      )
      .default([]),
    standalone_lists: z
      .array(
        z.object({
          list_name: z.string().min(1).max(30).describe("Name of the standalone list in root"),
          color: z.string().default("#87189d").describe("Hex color code for the list badge"),
          icon: z.string().optional().nullable().describe("Emoji shortcode for the list (e.g. :rocket:, :computer:, :mortar_board:) or null"),
          tasks: z
            .array(
              z.object({
                task_content: z.string().min(1).max(2000).describe("Title or content of the task"),
                target_date: z.string().optional().nullable().describe("ISO 8601 due date/time"),
                description: z.string().max(255).optional().nullable().describe("Optional note/details"),
              })
            )
            .default([]),
        })
      )
      .default([]),
  }),
  execute: async (params, context) => {
    const now = new Date().toISOString();
    let currentFolderRank = LexoRank.middle();

    const foldersInput = ((params.folders as HierarchyFolderInput[]) || []);
    const standaloneInput = ((params.standalone_lists as HierarchyListInput[]) || []);

    const preparedFolders: PreparedFolder[] = foldersInput.map((f: HierarchyFolderInput) => {
      const folderId = uuidv4();
      const folderRankStr = currentFolderRank.toString();
      currentFolderRank = currentFolderRank.genNext();

      let currentListRank = LexoRank.middle();
      const preparedLists: PreparedList[] = (f.lists || []).map((l: HierarchyListInput) => {
        const listId = uuidv4();
        const listRankStr = currentListRank.toString();
        currentListRank = currentListRank.genNext();

        let currentTaskRank = LexoRank.middle();
        const preparedTasks: PreparedTask[] = (l.tasks || []).map((t: HierarchyTaskInput) => {
          const taskId = uuidv4();
          const taskRankStr = currentTaskRank.toString();
          currentTaskRank = currentTaskRank.genNext();

          return {
            task_id: taskId,
            task_content: t.task_content,
            target_date: t.target_date ?? null,
            completed: false,
            rank: taskRankStr,
            index: 0,
            description: t.description ?? null,
          };
        });

        return {
          list_id: listId,
          list_name: l.list_name,
          color: l.color || "#87189d",
          icon: normalizeEmojiShortcode(l.icon),
          rank: listRankStr,
          index: 0,
          tasks: preparedTasks,
        };
      });

      return {
        folder_id: folderId,
        folder_name: f.folder_name,
        folder_color: f.folder_color || "#87189d",
        rank: folderRankStr,
        index: 0,
        lists: preparedLists,
      };
    });

    let currentStandaloneRank = LexoRank.middle();
    const preparedStandaloneLists: PreparedList[] = standaloneInput.map((l: HierarchyListInput) => {
      const listId = uuidv4();
      const listRankStr = currentStandaloneRank.toString();
      currentStandaloneRank = currentStandaloneRank.genNext();

      let currentTaskRank = LexoRank.middle();
      const preparedTasks: PreparedTask[] = (l.tasks || []).map((t: HierarchyTaskInput) => {
        const taskId = uuidv4();
        const taskRankStr = currentTaskRank.toString();
        currentTaskRank = currentTaskRank.genNext();

        return {
          task_id: taskId,
          task_content: t.task_content,
          target_date: t.target_date ?? null,
          completed: false,
          rank: taskRankStr,
          index: 0,
          description: t.description ?? null,
        };
      });

      return {
        list_id: listId,
        list_name: l.list_name,
        color: l.color || "#87189d",
        icon: normalizeEmojiShortcode(l.icon),
        rank: listRankStr,
        index: 0,
        tasks: preparedTasks,
      };
    });

    try {
      const { data: atomicData, error: atomicError } = await context.supabase.rpc(
        "create_workspace_hierarchy_atomic",
        {
          p_folders: preparedFolders,
          p_standalone_lists: preparedStandaloneLists,
          p_cost: 0,
        }
      );

      if (!atomicError && atomicData) {
        const totalFolders = preparedFolders.length;
        const totalLists =
          preparedFolders.reduce((acc, f) => acc + f.lists.length, 0) +
          preparedStandaloneLists.length;
        const totalTasks =
          preparedFolders.reduce(
            (acc, f) =>
              acc + f.lists.reduce((tAcc, l) => tAcc + l.tasks.length, 0),
            0
          ) +
          preparedStandaloneLists.reduce(
            (acc, l) => acc + l.tasks.length,
            0
          );

        return {
          success: true,
          message: `Estructura creada exitosamente: ${totalFolders} carpeta(s), ${totalLists} lista(s) y ${totalTasks} tarea(s).`,
          folders_count: totalFolders,
          lists_count: totalLists,
          tasks_count: totalTasks,
          data: atomicData,
        };
      }
    } catch (rpcErr: unknown) {
      console.warn("[createWorkspaceHierarchy] RPC failed, using server fallback:", rpcErr);
    }

    try {
      if (preparedFolders.length > 0) {
        const foldersToInsert = preparedFolders.map((f) => ({
          folder_id: f.folder_id,
          user_id: context.userId,
          folder_name: f.folder_name,
          folder_color: f.folder_color,
          index: f.index,
          rank: f.rank,
          pinned: false,
          created_at: now,
          updated_at: now,
        }));
        await context.supabase.from("list_folders").insert(foldersToInsert);
      }

      const allLists = [
        ...preparedFolders.flatMap((f) =>
          f.lists.map((l) => ({ ...l, folder_id: f.folder_id }))
        ),
        ...preparedStandaloneLists.map((l) => ({ ...l, folder_id: null })),
      ];

      if (allLists.length > 0) {
        const listsToInsert = allLists.map((l) => ({
          list_id: l.list_id,
          owner_id: context.userId,
          list_name: l.list_name,
          color: l.color,
          icon: l.icon,
          created_at: now,
          updated_at: now,
        }));
        await context.supabase.from("lists").insert(listsToInsert);

        const membershipsToInsert = allLists.map((l) => ({
          list_id: l.list_id,
          user_id: context.userId,
          role: "owner",
          rank: l.rank,
          index: l.index,
          folder: l.folder_id,
          shared_since: now,
          updated_at: now,
        }));
        await context.supabase.from("list_memberships").insert(membershipsToInsert);

        const allTasks = allLists.flatMap((l) =>
          l.tasks.map((t) => ({
            task_id: t.task_id,
            list_id: l.list_id,
            created_by: context.userId,
            task_content: t.task_content,
            target_date: t.target_date,
            completed: false,
            rank: t.rank,
            index: t.index,
            created_at: now,
            updated_at: now,
          }))
        );

        if (allTasks.length > 0) {
          for (let i = 0; i < allTasks.length; i += 50) {
            const chunk = allTasks.slice(i, i + 50);
            await context.supabase.from("tasks").insert(chunk);
          }
        }
      }

      const totalFolders = preparedFolders.length;
      const totalLists = allLists.length;
      const totalTasks = allLists.reduce((acc, l) => acc + l.tasks.length, 0);

      return {
        success: true,
        message: `Estructura creada exitosamente: ${totalFolders} carpeta(s), ${totalLists} lista(s) y ${totalTasks} tarea(s).`,
        folders_count: totalFolders,
        lists_count: totalLists,
        tasks_count: totalTasks,
      };
    } catch (batchErr: unknown) {
      console.error("[createWorkspaceHierarchy] Batch insert error:", batchErr);
      const msg = batchErr instanceof Error ? batchErr.message : "Error al crear jerarquía";
      return { error: msg };
    }
  },
};
