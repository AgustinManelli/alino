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

export async function GetSubjects() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("todos_data")
        .select(
          "*, tasks: tasks(id, category_id, description, completed, index, name, created_at, updated_at)"
        )
        .order("index", { ascending: true })
        .eq("user_id", data.session?.user.id)
        .then(({ data }) => {
          if (data) {
            data.forEach((todo) => {
              todo.tasks = todo.tasks.sort(
                (a: Task, b: Task) => a.index - b.index
              );
            });
          }
          return { data };
        });
      return result;
    }
  }
  return error;
}

export const AddListToDB = async (
  color: string,
  name: string,
  shortcodeemoji: string
) => {
  const setColor = color === "" ? "#87189d" : color;
  const supabase = await createClient();
  const sessionResult = await supabase.auth.getSession();

  if (!sessionResult.error) {
    if (sessionResult.data.session) {
      const user = sessionResult.data.session.user;
      const result = await supabase
        .from("todos_data")
        .insert({
          color: setColor,
          icon: shortcodeemoji,
          name: name,
          user_id: user.id,
        })
        .select()
        .single();
      return result;
    } else {
      return sessionResult;
    }
  } else {
    return sessionResult;
  }
};

export const DeleteListToDB = async (id: string) => {
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
