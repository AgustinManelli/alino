"use server";

import { createClient } from "@/utils/supabase/server";

type Task = {
  id: number;
  category_id: number;
  description: string;
  completed: boolean;
  index: number;
  name: string;
  created_at: string;
  updated_at: string;
};

export async function GetLists() {
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
    .select(
      "*, tasks: tasks(id, category_id, description, completed, index, name, created_at, updated_at)"
    )
    .order("index", { ascending: true })
    .eq("user_id", sessionData.session.user.id);

  if (error) {
    console.error("Error fetching data:", error);
    return { error };
  }

  // Ordenar las tareas dentro de cada lista
  if (data) {
    data.forEach((todo) => {
      todo.tasks = todo.tasks.sort((a: Task, b: Task) => a.index - b.index);
    });
  }

  return { data };
}

export const AddListToDB = async (
  color: string,
  name: string,
  shortcodeemoji: string
) => {
  const setColor = color === "" ? "#87189d" : color; // Establece el color predeterminado si está vacío

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
    .from("todos_data")
    .insert({
      color: setColor,
      icon: shortcodeemoji,
      name: name,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error };
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
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("todos_data")
        .update({ color: color, icon: shortcodeemoji })
        .eq("id", id)
        .select();
      return result;
    }
  }

  return error;
};

export const AddTaskToDB = async (category_id: string, name: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const user = data.session.user;
      const result = await supabase
        .from("tasks")
        .insert({
          category_id,
          user_id: user.id,
          name,
          description: "",
        })
        .select()
        .single();
      return result;
    }
  }
};

export const DeleteTaskToDB = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase.from("tasks").delete().eq("id", id);
      return result;
    }
  }
};

export const UpdateTasksCompleted = async (id: string, status: boolean) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("tasks")
        .update({ completed: status })
        .eq("id", id);
      return result;
    }
  }
};
