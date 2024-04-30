"use server";

import { createClient } from "@/utils/supabase/server";

export async function GetSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("todos_data")
        .select("*")
        .order("inserted_at", { ascending: true })
        .eq("user_id", data.session?.user.id);

      return result;
    }
  }

  return error;
}

export const AddListToDB = async (
  color: string | null,
  index: number | null,
  name: string | null
) => {
  const setColor = color === "" ? "#87189d" : color;
  const supabase = await createClient();
  const sessionResult = await supabase.auth.getSession();
  const { data: result } = await supabase
    .from("todos_data")
    .select("name")
    .eq("name", name);

  if (!sessionResult.error) {
    if (result && result.length === 0) {
      if (sessionResult.data.session) {
        const user = sessionResult.data.session.user;
        const result = await supabase
          .from("todos_data")
          .insert({ name, user_id: user.id, color: setColor, index })
          .select()
          .single();
        return result;
      } else {
        return sessionResult;
      }
    }
  } else {
    return sessionResult;
  }
};

export const DeleteSubjectToDB = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase.from("todos_data").delete().eq("id", id);
      return result;
    }
  }

  return error;
};

export const UpdateSubjectToDB = async (id: string, color: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("subjects")
        .update({ color: color })
        .eq("id", id)
        .select();
      return result;
    }
  }

  return error;
};

export const AddTaskToDB = async (
  task: string,
  status: boolean,
  priority: number,
  subject_id: string
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (subject_id === "home-tasks-static-alino-app") {
    if (!error) {
      if (data.session) {
        const user = data.session.user;
        const result = await supabase
          .from("todos")
          .insert({
            user_id: user.id,
            task,
            status,
            priority,
          })
          .select()
          .single();
        return result;
      }
    }
  } else {
    if (!error) {
      if (data.session) {
        const user = data.session.user;
        const result = await supabase
          .from("todos")
          .insert({
            user_id: user.id,
            subject_id,
            task,
            status,
            priority,
          })
          .select()
          .single();
        return result;
      }
    }
  }
};

export async function GetTasks() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("todos")
        .select("*")
        .order("inserted_at", { ascending: true })
        .eq("user_id", data.session?.user.id);
      return result;
    }
  }

  return error;
}

export const AddTaskHomeToDB = async (
  task: string,
  status: boolean,
  priority: number
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const user = data.session.user;
      const result = await supabase
        .from("todos-home")
        .insert({ user_id: user.id, task, status, priority })
        .select()
        .single();
      return result;
    }
  }
};

export async function GetTasksHome() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("todos-home")
        .select("*")
        .order("inserted_at", { ascending: true })
        .eq("user_id", data.session?.user.id);
      return result;
    }
  }

  return error;
}
