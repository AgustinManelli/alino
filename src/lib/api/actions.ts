"use server";
import { createClient as createClientServer } from "@/utils/supabase/server";
import { SupabaseClient, User } from "@supabase/supabase-js";
import { z } from "zod";

const AUTH_ERROR_MESSAGE = "User is not logged in or authentication failed";
const UNKNOWN_ERROR_MESSAGE = "An unknown error occurred.";

interface AuthClient {
  supabase: SupabaseClient;
  user: User;
}

const getAuthenticatedSupabaseClient = async (): Promise<AuthClient> => {
  const supabase = createClientServer();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError || !sessionData.session?.user) {
    throw new Error(AUTH_ERROR_MESSAGE);
  } else {
    return { supabase, user: sessionData.session.user };
  }
};

export async function getUser() {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`*, user_private (*)`)
      .eq("user_id", user.id)
      .single();

    if (userError) {
      throw new Error(
        "No se pudo obtener el usuario. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: { user: userData } };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}

export async function getLists() {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data: listsData, error: listsError } = await supabase
      .from("list_memberships")
      .select(`*, list: lists (*)`)
      .eq("user_id", user.id)
      .order("index", { ascending: true });

    if (listsError) {
      throw new Error(
        "No se pudieron obtener las listas. Intentalo nuevamente o contacta con soporte."
      );
    }

    if (!listsData || listsData.length === 0) {
      return { data: { lists: [], tasks: [] } };
    }

    const listIds = listsData.map((membership) => membership.list.list_id);

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
      .order("created_at", { ascending: false });

    if (tasksError) {
      throw new Error(
        "No se pudieron obtener las tareas. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: { lists: listsData, tasks: tasksData } };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
}

export const updateIndexList = async (list_id: string, index: number) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("list_memberships")
      .update({ index })
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

export const insertList = async (
  list_id: string,
  list_name: string,
  color: string | null,
  icon: string | null
) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.from("lists").insert({
      list_id: list_id,
      owner_id: user.id,
      list_name: list_name,
      color: color,
      icon: icon,
    });

    if (error) {
      throw new Error(
        "No se pudo insertar la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data: data?.[0] || null };
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
        list_name: list_name,
        color: color,
        icon: icon,
      })
      .eq("list_id", list_id);

    console.log("errores:", error, data);

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

export const updatePinnedList = async (list_id: string, pinned: boolean) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("list_memberships")
      .update({ pinned })
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

// export const updateIndexList = async (id: string, index: number) => {
//   try {
//     const { supabase } = await getAuthenticatedSupabaseClient();

//     const pickSchema = ListSchema.pick({
//       id: true,
//       index: true,
//     });
//     const validatedData = pickSchema.parse({ id, index });

//     const { data, error } = await supabase
//       .from("todos_data")
//       .update({ index: validatedData.index })
//       .eq("id", validatedData.id)
//       .select();

//     if (error) {
//       throw new Error(
//         "Failed to update the list index. Please try again later."
//       );
//     }

//     return { data };
//   } catch (error: unknown) {
//     if (error instanceof z.ZodError) {
//       return { error: error.errors.map((err) => err.message).join(". ") };
//     }

//     if (error instanceof Error) {
//       return { error: error.message };
//     }

//     return { error: UNKNOWN_ERROR_MESSAGE };
//   }
// };

// export const updateAllIndexLists = async () => {
//   try {
//     const { supabase, user } = await getAuthenticatedSupabaseClient();

//     const { data, error } = await supabase.rpc("update_todos_indices", {
//       p_user_id: user.id,
//     });

//     if (error) {
//       throw new Error(
//         "Failed to update the list indices. Please try again later."
//       );
//     }

//     return { data };
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return { error: error.message };
//     }

//     return { error: UNKNOWN_ERROR_MESSAGE };
//   }
// };

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
    const { supabase, user } = await getAuthenticatedSupabaseClient();

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
  completed: boolean | null
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase
      .from("tasks")
      .update({ task_content: task_content, completed: completed })
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

export const getUsersMembersList = async (list_id: string) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("get_list_members_users", {
      p_list_id: list_id,
    });

    if (error) {
      throw new Error(
        "No se pudo obtener los miembros de la lista. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
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
      switch (error.code) {
        case "UNATH":
          return {
            error:
              "Acceso no autorizado. Inténtalo nuevamente o contacta con soporte.",
          };
        case "USRNF":
          return { error: "El usuario ingresado no fue encontrado." };
        case "FRBDN":
          return {
            error: "No tienes permisos para invitar usuarios a esta lista.",
          };
        case "SLFIV":
          return { error: "No puedes invitarte a ti mismo." };
        case "ALRDM":
          return { error: "El usuario ya es miembro de la lista." };
        case "INVPD":
          return {
            error: "Ya existe una invitación pendiente para este usuario.",
          };
        case "LSTNF":
          return { error: "La lista no existe o hubo un error inesperado." };
        default:
          return {
            error: "Ocurrió un error inesperado. Por favor, intenta de nuevo.",
          };
      }
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { error: error.message };
    }

    return { error: UNKNOWN_ERROR_MESSAGE };
  }
};

export const getNotifications = async () => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: { notifications: [] } };
    }

    const { data, error } = await supabase
      .from("list_invitations")
      .select("*")
      .eq("invited_user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(
        `No se pudieron obtener las notificaciones: ${error.message}`
      );
    }

    if (!data) {
      return { data: { notifications: [] } };
    }

    return { data: { notifications: data } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

export const updateInvitationList = async (
  notification_id: string,
  status: string
) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { data: { notifications: [] } };
    }

    const { data, error } = await supabase
      .from("list_invitations")
      .update({ status: status })
      .eq("invited_user_id", user.id)
      .eq("invitation_id", notification_id);

    if (error) {
      throw new Error(`No se pudo aceptar la invitación: ${error.message}`);
    }

    if (!data) {
      return { data: { notifications: [] } };
    }

    return { data: { notifications: data } };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

export const setUsernameFirstTime = async (username: string) => {
  try {
    const { supabase } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("set_username_first_time", {
      p_username: username,
    });

    if (error) {
      throw new Error(`${error.message}`);
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

export const searchUsers = async (searchTerm: string) => {
  try {
    const { supabase, user } = await getAuthenticatedSupabaseClient();

    const { data, error } = await supabase.rpc("search_users_input", {
      p_search_term: searchTerm,
      p_exclude_user: user.id,
    });

    if (error) {
      throw new Error(
        "No se pudo obtener los usuarios. Intentalo nuevamente o contacta con soporte."
      );
    }

    return { data };
  } catch (error: unknown) {
    if (error instanceof Error) return { error: error.message };
    return { error: "UNKNOWN_ERROR" };
  }
};

// export const deleteAllTasks = async () => {
//   try {
//     const { supabase, user } = await getAuthenticatedSupabaseClient();

//     const { data, error } = await supabase
//       .from("tasks")
//       .delete()
//       .eq("user_id", user.id);

//     if (error) {
//       throw new Error("Failed to delete all tasks. Please try again later.");
//     }

//     return { data };
//   } catch (error: unknown) {
//     if (error instanceof Error) {
//       return { error: error.message };
//     }

//     return { error: UNKNOWN_ERROR_MESSAGE };
//   }
// };
