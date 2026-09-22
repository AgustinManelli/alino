import { z } from "zod";
import { AgentToolDefinition } from "../types";
import {
  searchTasksQuery,
  insertTask,
  updateTaskDetails,
  moveTask,
  updateCompletedTask,
  batchUpdateTaskStatus,
  completeAllTasksInList,
  deleteTask,
  clearCompletedTasks,
  deleteAllTasksAction,
} from "@/lib/api/task/actions";
import { insertList } from "@/lib/api/list/actions";
import { getAdminClient } from "@/utils/supabase/admin";
import { LexoRank } from "lexorank";
import { v4 as uuidv4 } from "uuid";

function parseTargetDate(dateStr?: string | null): string | null {
  if (!dateStr || !dateStr.trim()) return null;
  const trimmed = dateStr.trim();
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString();
  }
  return trimmed;
}

export const searchTasksTool: AgentToolDefinition = {
  name: "search_tasks",
  description:
    "Searches and filters tasks across user's lists and folders. Can filter by text keyword, completion status, date category, specific list_id/list_name, or folder_id/folder_name.",
  parameters: z.object({
    query: z.string().optional().describe("Search term or keyword to match against task title or description"),
    status: z.enum(["all", "pending", "completed"]).default("all").describe("Filter by completion state"),
    date_filter: z.enum(["all", "today", "overdue", "upcoming", "no_date"]).default("all").describe("Filter by task due date"),
    list_id: z.string().optional().describe("Filter by a specific list ID if known"),
    list_name: z.string().optional().describe("Filter by a specific list name if known"),
    folder_id: z.string().optional().describe("Filter tasks to only lists inside this folder ID"),
    folder_name: z.string().optional().describe("Filter tasks to only lists inside this folder name"),
    limit: z.number().int().min(1).max(50).default(20).describe("Maximum number of tasks to return"),
  }),
  execute: async (params, context) => {
    let targetListIds: string[] | undefined = params.list_id ? [params.list_id] : undefined;

    if (!targetListIds && params.list_name) {
      const { data: matchedList } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_name)")
        .eq("user_id", context.userId);

      const found = (matchedList || []).find((m: any) => {
        const lData = Array.isArray(m.list) ? m.list[0] : m.list;
        return lData?.list_name?.toLowerCase() === params.list_name?.toLowerCase();
      });
      if (found) {
        targetListIds = [found.list_id];
      }
    }

    if (!targetListIds && (params.folder_id || params.folder_name)) {
      let folderId = params.folder_id;
      if (!folderId && params.folder_name) {
        const { data: matchedFolder } = await context.supabase
          .from("list_folders")
          .select("folder_id")
          .eq("user_id", context.userId)
          .ilike("folder_name", params.folder_name.trim())
          .limit(1)
          .maybeSingle();

        if (matchedFolder) {
          folderId = matchedFolder.folder_id;
        }
      }

      if (folderId) {
        const { data: folderMemberships } = await context.supabase
          .from("list_memberships")
          .select("list_id")
          .eq("folder", folderId)
          .eq("user_id", context.userId);

        targetListIds = (folderMemberships || []).map((m: any) => m.list_id);
      }
    }

    const res = await searchTasksQuery({
      query: params.query,
      status: params.status,
      date_filter: params.date_filter,
      list_ids: targetListIds,
      limit: params.limit,
    });

    if (res.error) {
      return { error: res.error };
    }

    const tasks = (res.data || []).map((t: any) => ({
      task_id: t.task_id,
      task_content: t.task_content,
      description: t.description,
      target_date: t.target_date,
      completed: t.completed,
      list_id: t.list_id,
      list_name: t.list?.list_name ?? "General",
    }));

    return {
      count: tasks.length,
      tasks,
    };
  },
};

export const createTaskTool: AgentToolDefinition = {
  name: "create_task",
  description:
    "Creates a new task in a specified list (or the default/first list if not provided). Accepts title/content, list_id or list_name, optional description, and optional target/due date with realistic time in the user's timezone converted to ISO format.",
  parameters: z.object({
    task_content: z.string().min(1).max(2000).describe("The title or main content of the task"),
    list_id: z.string().optional().describe("ID of the list where the task should be placed"),
    list_name: z.string().optional().describe("Name of the list where the task should be placed if ID is not known"),
    description: z.string().max(255).optional().describe("Optional note or detailed description for the task"),
    target_date: z
      .string()
      .optional()
      .nullable()
      .describe(
        "Optional due date and time in ISO 8601 format (e.g. 2026-09-25T14:00:00.000Z), calculating realistic hours in the user's timezone"
      ),
  }),
  execute: async (params, context) => {
    let listId = params.list_id;

    if (!listId && params.list_name) {
      const { data: member } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId);

      const found = (member || []).find(
        (m: any) => m.list?.list_name?.trim().toLowerCase() === params.list_name?.trim().toLowerCase()
      );

      if (found) {
        listId = found.list_id;
      } else {
        const newListId = uuidv4();
        const listRank = LexoRank.middle().toString();
        await insertList(newListId, params.list_name.trim(), "#87189d", null, listRank, 0, null);
        listId = newListId;
      }
    }

    if (!listId) {
      const { data: memberships } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId)
        .order("index", { ascending: true })
        .limit(1);

      if (memberships && memberships.length > 0) {
        listId = memberships[0].list_id;
      } else {
        const newListId = uuidv4();
        const listRank = LexoRank.middle().toString();
        await insertList(newListId, "General", "#87189d", null, listRank, 0, null);
        listId = newListId;
      }
    }

    const taskId = uuidv4();
    const rank = LexoRank.middle().toString();
    const finalTargetDate = parseTargetDate(params.target_date);

    const result = await insertTask(
      listId,
      params.task_content,
      taskId,
      finalTargetDate,
      false,
      rank
    );

    if (result.error) {
      return { error: result.error };
    }

    if (params.description) {
      await updateTaskDetails(taskId, { description: params.description });
    }

    return {
      success: true,
      task: {
        task_id: taskId,
        task_content: params.task_content,
        description: params.description ?? null,
        target_date: finalTargetDate,
        list_id: listId,
        completed: false,
      },
    };
  },
};

export const updateTaskTool: AgentToolDefinition = {
  name: "update_task",
  description:
    "Reprograms, reschedules, or updates an existing task (due date, target_date, time, title, description, completion status, or list). MANDATORY: Always call this tool whenever the user asks to reschedule, postpone, change date/time, or edit a task. Accepts task_id or task_content/current_task_content.",
  parameters: z.object({
    task_id: z.string().optional().describe("Unique UUID of the task to update if known"),
    current_task_content: z.string().optional().describe("Current title or keywords of the task to locate it"),
    task_content: z.string().min(1).max(2000).optional().describe("Title or keywords of the task to locate it, or new title for the task"),
    new_task_content: z.string().min(1).max(2000).optional().describe("Optional new title if you are explicitly renaming the task"),
    description: z.string().max(255).optional().nullable().describe("New description or note for the task"),
    target_date: z.string().optional().nullable().describe("New target due date and time in ISO 8601 format (e.g. 2026-09-26T18:00:00.000Z), or null to remove it"),
    completed: z.boolean().optional().describe("Set true to complete, false to mark pending"),
    list_id: z.string().optional().describe("Move the task to a different list ID"),
    list_name: z.string().optional().describe("Filter by list name when searching task or move task to this list"),
  }),
  execute: async (params, context) => {
    let resolvedTaskId = params.task_id;
    const lookupTitle = (params.current_task_content || params.task_content)?.trim();

    if (!resolvedTaskId && lookupTitle) {
      let queryBuilder = context.supabase
        .from("tasks")
        .select("task_id, task_content, list_id, list:lists(list_name)")
        .ilike("task_content", `%${lookupTitle}%`);

      const { data: matchedTasks } = await queryBuilder.limit(10);
      if (matchedTasks && matchedTasks.length > 0) {
        if (params.list_name) {
          const matchWithList = matchedTasks.find((t: any) =>
            t.list?.list_name?.toLowerCase().includes(params.list_name!.toLowerCase())
          );
          if (matchWithList) {
            resolvedTaskId = matchWithList.task_id;
          }
        }
        if (!resolvedTaskId) {
          resolvedTaskId = matchedTasks[0].task_id;
        }
      }

      if (!resolvedTaskId && lookupTitle.includes(" ")) {
        const words = lookupTitle.split(/\s+/).filter((w: string) => w.length > 3);
        for (const word of words) {
          const { data: wordMatches } = await context.supabase
            .from("tasks")
            .select("task_id, task_content, list_id, list:lists(list_name)")
            .ilike("task_content", `%${word}%`)
            .limit(5);

          if (wordMatches && wordMatches.length > 0) {
            if (params.list_name) {
              const matchWithList = wordMatches.find((t: any) =>
                t.list?.list_name?.toLowerCase().includes(params.list_name!.toLowerCase())
              );
              if (matchWithList) {
                resolvedTaskId = matchWithList.task_id;
                break;
              }
            }
            if (!resolvedTaskId) {
              resolvedTaskId = wordMatches[0].task_id;
              break;
            }
          }
        }
      }
    }

    if (!resolvedTaskId) {
      return { error: `No se encontró la tarea "${lookupTitle || params.task_id}" para actualizar.` };
    }

    let updatedTitle: string | undefined = undefined;
    if (params.new_task_content) {
      updatedTitle = params.new_task_content;
    } else if (
      params.current_task_content &&
      params.task_content &&
      params.task_content !== params.current_task_content
    ) {
      updatedTitle = params.task_content;
    }

    let targetListId = params.list_id;
    if (!targetListId && params.list_name && !lookupTitle) {
      const { data: member } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_name)")
        .eq("user_id", context.userId);
      const foundList = (member || []).find(
        (m: any) => m.list?.list_name?.toLowerCase().includes(params.list_name!.toLowerCase())
      );
      if (foundList) {
        targetListId = foundList.list_id;
      }
    }

    if (targetListId) {
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        const adminClient = getAdminClient();
        await adminClient
          .from("tasks")
          .update({ list_id: targetListId })
          .eq("task_id", resolvedTaskId);
      }
    }

    const payload: Record<string, unknown> = {};

    if (updatedTitle !== undefined) payload.task_content = updatedTitle;
    if (params.description !== undefined) payload.description = params.description;
    if (params.target_date !== undefined) payload.target_date = parseTargetDate(params.target_date);
    if (params.completed !== undefined) {
      payload.completed = params.completed;
    }

    let updatedTask = null;
    if (Object.keys(payload).length > 0) {
      const { data, error: updateError } = await context.supabase
        .from("tasks")
        .update(payload)
        .eq("task_id", resolvedTaskId)
        .select("*, list:lists(list_id, list_name, color)")
        .single();

      if (updateError) {
        return { error: `Error al actualizar la tarea: ${updateError.message}` };
      }
      updatedTask = data;
    } else {
      const { data } = await context.supabase
        .from("tasks")
        .select("*, list:lists(list_id, list_name, color)")
        .eq("task_id", resolvedTaskId)
        .single();
      updatedTask = data;
    }

    return {
      success: true,
      task: updatedTask,
      message: `Tarea "${updatedTask?.task_content || lookupTitle}" actualizada exitosamente.`,
    };
  },
};

export const moveTaskTool: AgentToolDefinition = {
  name: "move_task",
  description: "Moves an existing task from its current list to a target list. Accepts task_id or task_content, and target_list_id or target_list_name.",
  parameters: z.object({
    task_id: z.string().optional().describe("UUID of the task to move"),
    task_content: z.string().optional().describe("Title of the task to move if task_id is not known"),
    target_list_id: z.string().optional().describe("UUID of destination list"),
    target_list_name: z.string().optional().describe("Name of destination list if target_list_id is not known"),
  }),
  execute: async (params, context) => {
    let resolvedTaskId = params.task_id;
    let resolvedListId = params.target_list_id;

    if (!resolvedTaskId && params.task_content) {
      const searchRes = await searchTasksQuery({
        query: params.task_content.trim(),
        limit: 1,
      });
      if (searchRes.data && searchRes.data.length > 0) {
        resolvedTaskId = searchRes.data[0].task_id;
      }
    }

    if (!resolvedListId && params.target_list_name) {
      const { data: memberships } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId);

      const found = (memberships || []).find(
        (m: any) =>
          m.list?.list_name?.trim().toLowerCase() === params.target_list_name?.trim().toLowerCase()
      );

      if (found) {
        resolvedListId = found.list_id;
      } else {
        const newListId = uuidv4();
        const listRank = LexoRank.middle().toString();
        await insertList(newListId, params.target_list_name.trim(), "#87189d", null, listRank, 0, null);
        resolvedListId = newListId;
      }
    }

    if (!resolvedTaskId || !resolvedListId) {
      return { error: "No se pudo identificar la tarea o la lista de destino." };
    }

    const res = await moveTask(resolvedTaskId, resolvedListId);
    if (res.error) {
      return { error: res.error };
    }
    return {
      success: true,
      message: "Tarea movida con éxito.",
      task: res.data,
    };
  },
};

export const toggleTaskStatusTool: AgentToolDefinition = {
  name: "toggle_task_status",
  description: "Marks a task as completed or pending. Accepts task_id or task_content.",
  parameters: z.object({
    task_id: z.string().optional().describe("UUID of the task"),
    task_content: z.string().optional().describe("Title of the task if task_id is not known"),
    completed: z.boolean().describe("true to mark completed, false to mark pending/uncompleted"),
  }),
  execute: async (params) => {
    let resolvedTaskId = params.task_id;

    if (!resolvedTaskId && params.task_content) {
      const searchRes = await searchTasksQuery({
        query: params.task_content.trim(),
        limit: 1,
      });
      if (searchRes.data && searchRes.data.length > 0) {
        resolvedTaskId = searchRes.data[0].task_id;
      }
    }

    if (!resolvedTaskId) {
      return { error: "No se encontró la tarea especificada." };
    }

    const res = await updateCompletedTask(resolvedTaskId, params.completed);
    if (res.error) {
      return { error: res.error };
    }
    return {
      success: true,
      task_id: resolvedTaskId,
      completed: params.completed,
    };
  },
};

export const batchToggleTasksTool: AgentToolDefinition = {
  name: "batch_toggle_tasks",
  description: "Marks multiple tasks as completed or pending at the same time.",
  parameters: z.object({
    task_ids: z.array(z.string().uuid()).min(1).describe("List of task UUIDs to update"),
    completed: z.boolean().describe("true to complete all, false to mark all pending"),
  }),
  execute: async (params) => {
    const res = await batchUpdateTaskStatus(params.task_ids, params.completed);
    if (res.error) {
      return { error: res.error };
    }
    return {
      success: true,
      updatedCount: res.data?.length ?? 0,
      completed: params.completed,
    };
  },
};

export const completeAllTasksInListTool: AgentToolDefinition = {
  name: "complete_all_tasks_in_list",
  description: "Marks all pending tasks in a given list as completed. Accepts list_id or list_name.",
  parameters: z.object({
    list_id: z.string().optional().describe("UUID of the list"),
    list_name: z.string().optional().describe("Name of the list if list_id is not known"),
  }),
  execute: async (params, context) => {
    let resolvedListId = params.list_id;

    if (!resolvedListId && params.list_name) {
      const { data: member } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId);

      const found = (member || []).find(
        (m: any) => m.list?.list_name?.trim().toLowerCase() === params.list_name?.trim().toLowerCase()
      );
      if (found) {
        resolvedListId = found.list_id;
      }
    }

    if (!resolvedListId) {
      return { error: "No se encontró la lista especificada." };
    }

    const res = await completeAllTasksInList(resolvedListId);
    if (res.error) {
      return { error: res.error };
    }
    return {
      success: true,
      completedCount: res.count,
    };
  },
};

export const deleteTaskTool: AgentToolDefinition = {
  name: "delete_task",
  description: "Permanently deletes a single task by its UUID or title.",
  isDestructive: true,
  parameters: z.object({
    task_id: z.string().optional().describe("UUID of the task to delete"),
    task_content: z.string().optional().describe("Title of the task to delete if UUID is not known"),
  }),
  execute: async (params) => {
    let resolvedTaskId = params.task_id;

    if (!resolvedTaskId && params.task_content) {
      const searchRes = await searchTasksQuery({
        query: params.task_content.trim(),
        limit: 1,
      });
      if (searchRes.data && searchRes.data.length > 0) {
        resolvedTaskId = searchRes.data[0].task_id;
      }
    }

    if (!resolvedTaskId) {
      return { error: "No se encontró la tarea a eliminar." };
    }

    const res = await deleteTask(resolvedTaskId);
    if (res.error) {
      return { error: res.error };
    }
    return {
      success: true,
      message: "Task deleted successfully",
      task_id: resolvedTaskId,
    };
  },
};

export const clearCompletedTasksTool: AgentToolDefinition = {
  name: "clear_completed_tasks",
  description: "Deletes all completed tasks inside a specific list. Accepts list_id or list_name.",
  isDestructive: true,
  parameters: z.object({
    list_id: z.string().optional().describe("UUID of the list to clear completed tasks from"),
    list_name: z.string().optional().describe("Name of the list if list_id is not known"),
  }),
  execute: async (params, context) => {
    let resolvedListId = params.list_id;

    if (!resolvedListId && params.list_name) {
      const { data: member } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_id, list_name)")
        .eq("user_id", context.userId);

      const found = (member || []).find(
        (m: any) => m.list?.list_name?.trim().toLowerCase() === params.list_name?.trim().toLowerCase()
      );
      if (found) {
        resolvedListId = found.list_id;
      }
    }

    if (!resolvedListId) {
      return { error: "No se encontró la lista especificada." };
    }

    const res = await clearCompletedTasks(resolvedListId);
    if (res.error) {
      return { error: res.error };
    }
    return {
      success: true,
      message: "Completed tasks cleared successfully",
    };
  },
};

export const deleteAllTasksTool: AgentToolDefinition = {
  name: "delete_all_tasks",
  description:
    "Permanently deletes all tasks in the user's workspace (or within a specific list). Use when the user asks to delete all tasks, clear everything, wipe tasks, or empty all lists.",
  isDestructive: true,
  parameters: z.object({
    list_id: z.string().optional().describe("Optional list ID to only delete tasks in that list"),
    list_name: z.string().optional().describe("Optional list name to only delete tasks in that list"),
    status: z
      .enum(["all", "completed", "pending"])
      .default("all")
      .describe("Filter which tasks to delete (all, completed only, or pending only)"),
  }),
  execute: async (params, context) => {
    let targetListId = params.list_id;

    if (!targetListId && params.list_name) {
      const { data: memberships } = await context.supabase
        .from("list_memberships")
        .select("list_id, list:lists(list_name)")
        .eq("user_id", context.userId);

      const found = (memberships || []).find((m: any) => {
        const lData = Array.isArray(m.list) ? m.list[0] : m.list;
        return lData?.list_name?.toLowerCase() === params.list_name?.toLowerCase();
      });
      if (found) targetListId = found.list_id;
    }

    const res = await deleteAllTasksAction({
      list_id: targetListId,
      status: params.status,
    });

    if (res.error) {
      return { error: res.error };
    }

    const scopeDesc = targetListId
      ? `en la lista "${params.list_name || targetListId}"`
      : "en toda tu cuenta";

    return {
      success: true,
      message: `Se eliminaron exitosamente ${res.count ?? 0} tarea(s) ${scopeDesc}.`,
      deleted_count: res.count ?? 0,
    };
  },
};

export const tasksTools: AgentToolDefinition[] = [
  searchTasksTool,
  createTaskTool,
  updateTaskTool,
  moveTaskTool,
  toggleTaskStatusTool,
  batchToggleTasksTool,
  completeAllTasksInListTool,
  deleteTaskTool,
  clearCompletedTasksTool,
  deleteAllTasksTool,
];
