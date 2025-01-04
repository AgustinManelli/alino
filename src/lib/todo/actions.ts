"use server";

import { createClient } from "@/utils/supabase/server";

import { Database, tasks as Task } from "@/lib/todosSchema";
type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export async function GetLists() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User is not logged in");
  }

  const { data, error } = await supabase
    .from("todos_data")
    .select(
      "*, tasks: tasks(id, category_id, description, completed, index, name, created_at, updated_at)"
    )
    .order("index", { ascending: true });
  //.eq("user_id", user.id); Is not necessary

  if (error) {
    console.error("Error fetching data:", error);
    return { error };
  }

  // Ordenar las tareas dentro de cada lista
  if (data) {
    data.forEach((todo) => {
      todo.tasks = todo.tasks.sort((a: Task, b: Task) => b.index - a.index);
    });
  }

  return { data };
}

export const AddListToDB = async (
  index: number,
  color: string,
  name: string,
  shortcodeemoji: string
) => {
  const setColor = color === "" ? "#87189d" : color; // Establece el color predeterminado si está vacío

  const supabase = createClient();
  const { data: sessionData, error: sessionError } =
    await supabase.auth.getSession();
  if (sessionError || !sessionData?.session) {
    return { error: sessionError || new Error("No active session found") };
  }

  const user = sessionData.session.user;

  const { data, error } = await supabase
    .from("todos_data")
    .insert({
      index: index,
      color: setColor,
      icon: shortcodeemoji,
      name: name,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: new Error("Failed to insert the list into the database") };
  }

  return { data };
};

export const DeleteListToDB = async (id: string) => {
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

export const UpdateListNameToDB = async (id: string, newName: string) => {
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
    .update({ name: newName })
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

export const AddTaskToDB = async (category_id: string, name: string) => {
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
