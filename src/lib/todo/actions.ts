"use server";

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";

import { ListSchema, TaskSchema } from "@/lib/schemas/validationSchemas";

const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed";
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

interface AuthClient {
  supabase: SupabaseClient;
  user: User;
}

const getAuthenticatedSupabaseClient = async (): Promise<AuthClient> => {
  const supabase = createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    throw new Error(AUTH_ERROR_MESSAGE);
  } else {
    return { supabase, user: sessionData.session.user };
  }
};

export async function getLists() {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .select("*, tasks: tasks(*)")
      .eq("user_id", user.id)
      .order("index", { ascending: true })
      .limit(20)
      .order("created_at", { ascending: true, referencedTable: "tasks" })
      .limit(50, { referencedTable: "tasks" });

    if (error) {
      throw new Error(
        "Failed to fetch lists from the database. Please try again later."
      );
    }

    const listsData = data.map(({ tasks, ...list }) => list);
    const tasksData = data.flatMap((list) => list.tasks || []);

    return { data: { lists: listsData, tasks: tasksData } };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}

export const insertList = async (
  index: number,
  color: string,
  name: string,
  shortcodeemoji: string | null,
  id: string
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const pickSchema = ListSchema.pick({
      index: true,
      color: true,
      name: true,
      shortcodeemoji: true,
      id: true,
    });
    const validatedData = pickSchema.parse({
      index,
      color,
      name,
      shortcodeemoji,
      id,
    });
    const setColor =
      validatedData.color === "" ? "#87189d" : validatedData.color;

    const { data, error } = await supabase
      .from("todos_data")
      .insert({
        index: validatedData.index,
        color: setColor,
        icon: validatedData.shortcodeemoji,
        name: validatedData.name,
        user_id: user.id,
        id: validatedData.id,
      })
      .select()
      .single();

    if (error) {
      throw new Error(
        "Failed to insert the list into the database. Please try again later."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((err) => err.message).join(". ") };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteList = async (id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const pickSchema = ListSchema.pick({ id: true });
    const validatedData = pickSchema.parse({ id });

    const { error } = await supabase
      .from("todos_data")
      .delete()
      .eq("id", validatedData.id);

    if (error) {
      throw new Error(
        "Failed to delete the list from the database. Please try again later."
      );
    }
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

export const updateDataList = async (
  id: string,
  name: string,
  color: string,
  shortcodeemoji: string | null
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const pickSchema = ListSchema.pick({
      id: true,
      name: true,
      color: true,
      shortcodeemoji: true,
    });
    const validatedData = pickSchema.parse({ id, name, color, shortcodeemoji });

    const { data, error } = await supabase
      .from("todos_data")
      .update({
        name: validatedData.name,
        color: validatedData.color,
        icon: validatedData.shortcodeemoji,
      })
      .eq("id", validatedData.id)
      .select();

    if (error) {
      throw new Error("Failed to update the list. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((err) => err.message).join(". ") };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updatePinnedList = async (id: string, pinned: boolean) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const pickSchema = ListSchema.pick({
      id: true,
      pinned: true,
    });
    const validatedData = pickSchema.parse({ id, pinned });

    const { data, error } = await supabase
      .from("todos_data")
      .update({ pinned: validatedData.pinned })
      .eq("id", validatedData.id)
      .select();

    if (error) {
      throw new Error("Failed to update the list. Please try again later.");
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

export const updateIndexList = async (id: string, index: number) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const pickSchema = ListSchema.pick({
      id: true,
      index: true,
    });
    const validatedData = pickSchema.parse({ id, index });

    const { data, error } = await supabase
      .from("todos_data")
      .update({ index: validatedData.index })
      .eq("id", validatedData.id)
      .select();

    if (error) {
      throw new Error(
        "Failed to update the list index. Please try again later."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((err) => err.message).join(". ") };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateAllIndexLists = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("update_todos_indices", {
      p_user_id: user.id,
    });

    if (error) {
      throw new Error(
        "Failed to update the list indices. Please try again later."
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

export const deleteAllLists = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .delete()
      .eq("user_id", user.id);

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

export const insertTask = async (
  category_id: string,
  name: string,
  id: string
) => {
  try {
    const pickSchema = TaskSchema.pick({
      category_id: true,
      name: true,
      id: true,
    });
    const validatedData = pickSchema.parse({ category_id, name, id });

    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        id: validatedData.id,
        category_id: validatedData.category_id,
        user_id: user.id,
        name: validatedData.name,
        description: "",
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
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((err) => err.message).join(". ") };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteTask = async (id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const pickSchema = TaskSchema.pick({
      id: true,
    });
    const validatedData = pickSchema.parse({ id });

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", validatedData.id);

    if (error) {
      throw new Error("Failed to delete the task. Please try again later.");
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

export const updateCompletedTask = async (id: string, completed: boolean) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const pickSchema = TaskSchema.pick({
      id: true,
      completed: true,
    });
    const validatedData = pickSchema.parse({ id, completed });

    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: validatedData.completed })
      .eq("id", validatedData.id)
      .eq("user_id", user.id);

    if (error) {
      throw new Error(
        "Failed to update the task status. Please try again later."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return { error: error.errors.map((err) => err.message).join(". ") };
    }

    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteAllTasks = async () => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .delete()
      .eq("user_id", user.id);

    if (error) {
      throw new Error("Failed to delete all tasks. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};
