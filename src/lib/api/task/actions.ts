"use server";

import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";

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
  note: boolean
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
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        "Failed to add the task to the database. Please try again later."
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

export const insertTasks = async (
  tasks: {
    list_id: string;
    task_content: string;
    task_id: string;
    target_date: string | null;
    completed: boolean | null;
  }[]
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const insertData = tasks.map((t) => ({
      ...t,
      created_by: user.id,
    }));

    const { data: insertedData, error } = await supabase
      .from("tasks")
      .insert(insertData)
      .select();

    if (error) {
      throw new Error(
        "Failed to add tasks to the database. Please try again later."
      );
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
      .update({ task_content: task_content, completed: completed, target_date: target_date})
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
      .order("created_at", { ascending: false })
      .range(from, to);

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
