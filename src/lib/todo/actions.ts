"use server";

import { createClient } from "@/utils/supabase/server";

export async function GetSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("subjects")
        .select("*")
        .order("inserted_at", { ascending: true })
        .eq("user_id", data.session?.user.id);

      return result;
    }
  }

  return error;
}

export const AddSubjectToDB = async (subject: string, color: string) => {
  const setColor = color === "" ? "#87189d" : color;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  const { data: result } = await supabase
    .from("subjects")
    .select("subject")
    .eq("subject", subject);

  if (result && result.length === 0) {
    if (!error) {
      if (data.session) {
        const user = data.session.user;
        const result = await supabase
          .from("subjects")
          .insert({ subject, user_id: user.id, color: setColor })
          .select()
          .single();
        return result;
      }
    }
  }
};

export const DeleteSubjectToDB = async (id: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase.from("subjects").delete().eq("id", id);
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

  if (!error) {
    if (data.session) {
      const user = data.session.user;
      if (subject_id === "home-tasks-static-alino-app") {
        const result = await supabase
          .from("todos-home")
          .insert({ user_id: user.id, task, status, priority })
          .select()
          .single();
        return result;
      } else {
        const result = await supabase
          .from("todos")
          .insert({ user_id: user.id, subject_id, task, status, priority })
          .select()
          .single();
        return result;
      }
    }
  }

  return error;
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
