"use server";

import { createClient } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";

const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed.";
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
  }

  return { supabase, user: sessionData.session.user };
};

const ListSchema = z.object({
  index: z.number().int().min(0),
  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "El color debe ser un código hexadecimal válido o un emoji"
    ),
  name: z
    .string()
    .min(1, "El nombre no puede estar vacío")
    .max(25, "El nombre de las listas no pueden tener más de 25 caracteres"),
  shortcodeemoji: z.string().optional(),
  tempId: z.string().uuid("ID debe ser un UUID válido"),
});

export async function getLists() {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .select(
        "*, tasks: tasks(id, category_id, description, completed, index, name, created_at, updated_at)"
      )
      .eq("user_id", user.id)
      .order("index", { ascending: true });

    if (error)
      throw new Error(
        "Failed to fetch lists from the database. Please try again later."
      );
    return { data };
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
  shortcodeemoji: string,
  tempId: string
) => {
  try {
    const validatedData = ListSchema.parse({
      index,
      color,
      name,
      shortcodeemoji,
      tempId,
    });
    const setColor =
      validatedData.color === "" ? "#87189d" : validatedData.color;
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .insert({
        index: validatedData.index,
        color: setColor,
        icon: validatedData.shortcodeemoji,
        name: validatedData.name,
        user_id: user.id,
        id: validatedData.tempId,
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

    const { error } = await supabase.from("todos_data").delete().eq("id", id);

    if (error) {
      throw new Error(
        "Failed to delete the list from the database. Please try again later."
      );
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateColorList = async (
  color: string,
  id: string,
  shortcodeemoji: string
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .update({ color: color, icon: shortcodeemoji })
      .eq("id", id)
      .select();

    if (error) {
      throw new Error("Failed to update the list. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updateIndexList = async (id: string, newIndex: number) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .update({ index: newIndex })
      .eq("id", id)
      .select();

    if (error) {
      throw new Error(
        "Failed to update the list index. Please try again later."
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

export const updateDataList = async (
  id: string,
  newName: string,
  color: string,
  emoji: string | null
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("todos_data")
      .update({ name: newName, color: color, icon: emoji })
      .eq("id", id)
      .select();

    if (error) {
      throw new Error("Failed to update the list. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const updatePinnedList = async (id: string, pinned: boolean) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const { data, error } = await supabase
      .from("todos_data")
      .update({ pinned: pinned })
      .eq("id", id)
      .select();

    if (error) {
      throw new Error("Failed to update the list. Please try again later.");
    }

    return { data };
  } catch (error: unknown) {
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
  tempId: string
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .insert({
        id: tempId,
        category_id,
        user_id: user.id,
        name,
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
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const deleteTask = async (id: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.from("tasks").delete().eq("id", id);

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

export const updateCompletedTask = async (id: string, status: boolean) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({ completed: status })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

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
