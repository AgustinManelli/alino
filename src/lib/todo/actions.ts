"use server";

import { createClient } from "@/utils/supabase/server";

import { Database } from "@/lib/todosSchema";
type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];
type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

export async function getLists() {
  // Crear cliente de Supabase
  const supabase = createClient();

  // Obtener usuario autenticado
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return {
      error: new Error("User is not logged in or authentication failed"),
    };
  }

  const user = userData.user;

  // Realizar consulta de las listas con sus tareas asociadas
  const { data, error } = await supabase
    .from("todos_data")
    .select(
      "*, tasks: tasks(id, category_id, description, completed, index, name, created_at, updated_at)"
    )
    .eq("user_id", user.id)
    .order("index", { ascending: true });

  if (error) {
    return { error: new Error("Failed to fetch lists from the database") };
  }

  // Retornar datos
  return { data };
}

export const insertList = async (
  index: number,
  color: string,
  name: string,
  shortcodeemoji: string,
  tempId: string
) => {
  // Establece el color predeterminado si está vacío
  const setColor = color === "" ? "#87189d" : color;

  // Crear cliente de Supabase
  const supabase = createClient();

  // Obtener usuario autenticado
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError || !userData?.user) {
    return {
      error: new Error("User is not logged in or authentication failed"),
    };
  }

  const user = userData.user;

  //Añadir tarea a base de datos
  const { data, error } = await supabase
    .from("todos_data")
    .insert({
      index: index,
      color: setColor,
      icon: shortcodeemoji,
      name: name,
      user_id: user.id,
      id: tempId,
    })
    .select()
    .single();

  if (error) {
    return { error: new Error("Failed to insert the list into the database") };
  }

  // Retornar datos
  return { data };
};

export const deleteList = async (id: string) => {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase
    .from("todos_data")
    .delete()
    .eq("id", id);

  if (error) {
    return { error };
  }

  return { data };
};

export const UpdateDataListToDB = async (
  color: string,
  id: string,
  shortcodeemoji: string
) => {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase
    .from("todos_data")
    .update({ color: color, icon: shortcodeemoji })
    .eq("id", id)
    .select();

  if (error) {
    return { error };
  }

  return { data };
};

export const UpdateIndexListToDB = async (id: string, newIndex: number) => {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase
    .from("todos_data")
    .update({ index: newIndex })
    .eq("id", id)
    .select();

  if (error) {
    return { error };
  }

  return { data };
};

export const UpdateListNameToDB = async (
  id: string,
  newName: string,
  color: string,
  emoji: string
) => {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase
    .from("todos_data")
    .update({ name: newName, color: color, icon: emoji })
    .eq("id", id)
    .select();

  if (error) {
    return { error };
  }

  return { data };
};

export const UpdatePinnedListToDB = async (id: string, pinned: boolean) => {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase
    .from("todos_data")
    .update({ pinned: pinned })
    .eq("id", id)
    .select();

  if (error) {
    return { error };
  }

  return { data };
};

export const UpdateAllIndexLists = async (id: string) => {
  const supabase = createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase.rpc("update_todos_indices", {
    p_user_id: sessionData.session.user.id,
  });

  if (error) {
    return { error };
  }

  return { data };
};

export const AddTaskToDB = async (
  category_id: string,
  name: string,
  tempId: string
) => {
  const supabase = createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const user = sessionData.session.user;
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
    return { error };
  }

  return { data };
};

export const DeleteTaskToDB = async (id: string) => {
  const supabase = createClient();

  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!sessionData.session) {
    return { error: new Error("No active session found") };
  }

  const { data, error } = await supabase.from("tasks").delete().eq("id", id);

  if (error) {
    return { error };
  }

  return { data };
};

export const UpdateTasksCompleted = async (id: string, status: boolean) => {
  const supabase = createClient();
  const { data, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    return { error: sessionError };
  }

  if (!data.session) {
    const error = new Error("No active session found");
    return { error };
  }

  const { error: updateError, data: updateData } = await supabase
    .from("tasks")
    .update({ completed: status })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return { error: updateError };
  }

  return { data: updateData };
};
