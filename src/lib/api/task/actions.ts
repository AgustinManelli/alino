"use server";

import { MAX_TASKS_PER_REQUEST, TASK_CHAR_LIMIT } from "@/config/app-config";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { getAdminClient } from "@/utils/supabase/admin";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { TaskSortOption } from "@/lib/schemas/todo.types";
export type { TaskSortOption };

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

export const insertTask = async (
  list_id: string,
  task_content: string,
  task_id: string,
  target_date: string | null,
  note: boolean,
  rank: string | null
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        task_id,
        list_id,
        created_by: user.id,
        task_content,
        target_date,
        completed: note ? null : false,
        rank,
      })
      .select()
      .single();

    if (error) {
      console.error("[insertTask] Supabase error:", error);
      throw new Error(error.message || "Failed to add the task to the database.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const insertTasks = async (
  tasks: {
    list_id: string;
    task_content: string;
    task_id: string;
    target_date: string | null;
    completed: boolean | null;
    rank: string | null;
  }[]
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    if (!tasks || tasks.length === 0) return { data: [] };
    if (tasks.length > MAX_TASKS_PER_REQUEST) {
      throw new Error("No puedes insertar tantas tareas a la vez.");
    }

    const insertData = tasks.map((t) => {
      if (t.task_content.length > TASK_CHAR_LIMIT) {
        throw new Error("El contenido de la tarea es demasiado largo.");
      }
      return {
        ...t,
        created_by: user.id,
      };
    });

    const { data: insertedData, error } = await supabase
      .from("tasks")
      .insert(insertData)
      .select();

    if (error) {
      console.error("[insertTasks] Supabase error:", error);
      throw new Error(error.message || "Failed to add tasks to the database.");
    }

    return { data: insertedData };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteTask = async (task_id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("task_id", task_id);

    if (error) {
      throw new Error("Failed to delete the task. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const clearCompletedTasks = async (list_id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("list_id", list_id)
      .eq("completed", true);

    if (error) {
      throw new Error("No se pudieron eliminar las tareas completadas.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateCompletedTask = async (
  task_id: string,
  completed: boolean
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: completed })
      .eq("task_id", task_id);

    if (error) {
      throw new Error(
        "Failed to update the task status. Please try again later."
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

export const updateNameTask = async (
  task_id: string,
  task_content: string,
  completed: boolean | null,
  target_date: string | null
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({ task_content: task_content, completed: completed, target_date: target_date })
      .eq("task_id", task_id);

    if (error) {
      throw new Error(
        "Failed to update the task status. Please try again later."
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

export const updateTaskRank = async (
  task_id: string,
  rank: string
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({ rank: rank })
      .eq("task_id", task_id);

    if (error) {
      throw new Error(
        "Failed to update the task rank. Please try again later."
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

export const getSummary = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: dashboardData, error } = await supabase.rpc("get_user_dashboard", {
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(
        "No se pudo obtener el resumen. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: { summary: dashboardData[0] } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const getStats = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: statsData, error } = await supabase.rpc("get_user_stats", {
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(
        "No se pudo obtener las estadísticas. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: statsData[0] };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const getUpcomingTasks = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: upcomingTasks, error } = await supabase.rpc("get_upcoming_tasks", {
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(
        "No se pudo obtener las tareas. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: upcomingTasks };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};



export const getPaginatedTasks = async (
  listIds: string[],
  page: number = 0,
  limit: number = 15,
  sort: TaskSortOption = "default"
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    if (!listIds || listIds.length === 0) {
      return { data: [] };
    }

    const from = page * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("tasks")
      .select(
        `*,
        created_by:users (
          user_id,
          display_name,
          username,
          avatar_url
        )`
      )
      .in("list_id", listIds)
      .or("completed.is.null,completed.eq.false");

    switch (sort) {
      case "due_asc":
        query = query
          .order("target_date", { ascending: true, nullsFirst: false })
          .order("created_at", { ascending: false });
        break;
      case "due_desc":
        query = query
          .order("target_date", { ascending: false, nullsFirst: true })
          .order("created_at", { ascending: false });
        break;
      case "alpha_asc":
        query = query.order("task_content", { ascending: true });
        break;
      case "alpha_desc":
        query = query.order("task_content", { ascending: false });
        break;
      default:
        query = query
          .order("rank", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false });
        break;
    }

    query = query.range(from, to);

    const { data: tasksData, error: tasksError } = await query;

    if (tasksError) {
      throw new Error(
        "No se pudieron cargar las tareas. Intentalo nuevamente."
      );
    }

    return { data: tasksData || [] };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const getCompletedTasks = async (
  listIds: string[],
  page: number = 0,
  limit: number = 40
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    if (!listIds || listIds.length === 0) {
      return { data: [] };
    }

    const from = page * limit;
    const to = from + limit - 1;

    const { data: tasksData, error: tasksError } = await supabase
      .from("tasks")
      .select(
        `*,
        created_by:users (
          user_id,
          display_name,
          username,
          avatar_url
        )`
      )
      .in("list_id", listIds)
      .eq("completed", true)
      .order("updated_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (tasksError) {
      throw new Error(
        "No se pudieron cargar las tareas completadas. Intentalo nuevamente."
      );
    }

    return { data: tasksData || [] };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const moveTask = async (
  task_id: string,
  target_list_id: string,
  rank: string | null = null
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: membership } = await supabase
      .from("list_memberships")
      .select("list_id")
      .eq("list_id", target_list_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      throw new Error("No tienes permisos en la lista de destino.");
    }

    const clientToUse = process.env.SUPABASE_SERVICE_ROLE_KEY ? getAdminClient() : supabase;
    const updatePayload: { list_id: string; rank?: string | null } = {
      list_id: target_list_id,
    };
    if (rank !== undefined && rank !== null) {
      updatePayload.rank = rank;
    }

    const { data, error } = await clientToUse
      .from("tasks")
      .update(updatePayload)
      .eq("task_id", task_id)
      .select("*, list:lists(list_id, list_name, color)")
      .single();

    if (error) {
      console.error("[moveTask] Error:", error);
      throw new Error("No se pudo mover la tarea: " + error.message);
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateTaskDetails = async (
  task_id: string,
  updates: {
    task_content?: string;
    description?: string | null;
    target_date?: string | null;
    completed?: boolean | null;
    list_id?: string;
  }
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    if (updates.list_id !== undefined && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { data: membership } = await supabase
        .from("list_memberships")
        .select("list_id")
        .eq("list_id", updates.list_id)
        .eq("user_id", user.id)
        .maybeSingle();

      if (membership) {
        const adminClient = getAdminClient();
        await adminClient
          .from("tasks")
          .update({ list_id: updates.list_id })
          .eq("task_id", task_id);
      }
    }

    const payload: Record<string, unknown> = {};

    if (updates.task_content !== undefined) payload.task_content = updates.task_content;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.target_date !== undefined) payload.target_date = updates.target_date;
    if (updates.completed !== undefined) payload.completed = updates.completed;

    if (Object.keys(payload).length > 0) {
      const { data, error } = await supabase
        .from("tasks")
        .update(payload)
        .eq("task_id", task_id)
        .select("*, list:lists(list_id, list_name, color)")
        .single();

      if (error) {
        throw new Error("No se pudo actualizar la tarea: " + error.message);
      }

      return { data };
    }

    const { data } = await supabase
      .from("tasks")
      .select("*, list:lists(list_id, list_name, color)")
      .eq("task_id", task_id)
      .single();

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const batchUpdateTaskStatus = async (
  task_ids: string[],
  completed: boolean
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    if (!task_ids || task_ids.length === 0) return { data: [] };

    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed,
      })
      .in("task_id", task_ids)
      .select("task_id, task_content, completed, list_id");

    if (error) {
      throw new Error("Error al actualizar estado de tareas: " + error.message);
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const completeAllTasksInList = async (list_id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({
        completed: true,
      })
      .eq("list_id", list_id)
      .or("completed.is.null,completed.eq.false")
      .select("task_id, task_content, completed");

    if (error) {
      throw new Error("Error al completar todas las tareas: " + error.message);
    }

    return { data, count: data?.length ?? 0 };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export interface SearchTasksOptions {
  query?: string;
  list_ids?: string[];
  status?: "all" | "pending" | "completed";
  date_filter?: "today" | "overdue" | "upcoming" | "no_date" | "all";
  limit?: number;
}

export const searchTasksQuery = async (options: SearchTasksOptions = {}) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    let targetListIds = options.list_ids;
    if (!targetListIds || targetListIds.length === 0) {
      const { data: memberships } = await supabase
        .from("list_memberships")
        .select("list_id")
        .eq("user_id", user.id);
      targetListIds = (memberships || []).map((m: { list_id: string }) => m.list_id);
    }

    if (!targetListIds || targetListIds.length === 0) {
      return { data: [] };
    }

    let queryBuilder = supabase
      .from("tasks")
      .select("task_id, task_content, description, target_date, completed, rank, created_at, list_id, list:lists(list_id, list_name, color, icon)")
      .in("list_id", targetListIds);

    if (options.status === "pending") {
      queryBuilder = queryBuilder.or("completed.is.null,completed.eq.false");
    } else if (options.status === "completed") {
      queryBuilder = queryBuilder.eq("completed", true);
    }

    if (options.query && options.query.trim().length > 0) {
      const term = `%${options.query.trim()}%`;
      queryBuilder = queryBuilder.or(`task_content.ilike.${term},description.ilike.${term}`);
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

    if (options.date_filter === "today") {
      queryBuilder = queryBuilder
        .gte("target_date", todayStart)
        .lte("target_date", todayEnd);
    } else if (options.date_filter === "overdue") {
      queryBuilder = queryBuilder
        .lt("target_date", now.toISOString())
        .or("completed.is.null,completed.eq.false");
    } else if (options.date_filter === "upcoming") {
      queryBuilder = queryBuilder
        .gt("target_date", now.toISOString())
        .or("completed.is.null,completed.eq.false");
    } else if (options.date_filter === "no_date") {
      queryBuilder = queryBuilder.is("target_date", null);
    }

    queryBuilder = queryBuilder
      .order("completed", { ascending: true })
      .order("target_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(options.limit ?? 50);

    const { data, error } = await queryBuilder;

    if (error) {
      throw new Error("Error al buscar tareas: " + error.message);
    }

    return { data: data || [] };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteAllTasksAction = async (options?: {
  list_id?: string;
  status?: "all" | "completed" | "pending";
}) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    let listIds: string[] = [];
    if (options?.list_id) {
      listIds = [options.list_id];
    } else {
      const { data: memberships } = await supabase
        .from("list_memberships")
        .select("list_id")
        .eq("user_id", user.id);
      listIds = (memberships || []).map((m: any) => m.list_id);
    }

    if (listIds.length === 0) {
      return { count: 0 };
    }

    let query = supabase.from("tasks").delete().in("list_id", listIds);

    if (options?.status === "completed") {
      query = query.eq("completed", true);
    } else if (options?.status === "pending") {
      query = query.or("completed.is.null,completed.eq.false");
    }

    const { data, error } = await query.select("task_id");

    if (error) {
      console.error("[deleteAllTasksAction] Error:", error);
      throw new Error("Error al eliminar tareas: " + error.message);
    }

    return { count: data?.length ?? 0 };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

