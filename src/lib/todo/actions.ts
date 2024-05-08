"use server";

import { createClient } from "@/utils/supabase/server";
import { Database } from "@/lib/todosSchema";

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
        .order("inserted_at", { ascending: true })
        .eq("user_id", data.session?.user.id);
      return result;
    }
  }

  return error;
}

type dataList = {
  url: string;
  icon: string;
  type: string;
  color: string;
};

type ListsType = Database["public"]["Tables"]["todos_data"]["Row"];

export const AddListToDB = async (
  color: string,
  index: number | null,
  name: string,
  list: ListsType[],
  shortcodeemoji: string
) => {
  const setColor = color === "" ? "#87189d" : color;
  const supabase = await createClient();
  const sessionResult = await supabase.auth.getSession();

  console.log(supabase);

  function stringParseURL(name: string) {
    const low = name.toLowerCase();
    const textws = low.replace(" ", "");
    const parsed = textws.replace(/[^a-z0-9-_.]/g, "");
    return parsed;
  }

  function stringParseName(name: string) {
    const parsed = name.replace(/[^A-Za-z0-9-\s_ÁáÉéÍíÓóÚú.]/g, "");
    return parsed;
  }

  const detectName = list.some((object) => object.name === name);
  const parsedData = {
    type: stringParseName(name),
    color: setColor,
    url: stringParseURL(name),
    icon: shortcodeemoji,
  };

  if (!sessionResult.error) {
    if (!detectName) {
      if (sessionResult.data.session) {
        const user = sessionResult.data.session.user;
        const result = await supabase
          .from("todos_data")
          .insert({
            name: stringParseURL(name),
            user_id: user.id,
            data: parsedData,
            index,
          })
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
  dataList: dataList,
  color: string,
  id: string,
  shortcodeemoji: string
) => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();

  const dataParse = { ...dataList };
  dataParse.color = color;
  dataParse.icon = shortcodeemoji;

  if (!error) {
    if (data.session) {
      const result = await supabase
        .from("todos_data")
        .update({ data: dataParse })
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
      const user = data.session.user;
      const result = await supabase.from("tasks").delete().eq("id", id);
      return result;
    }
  }
};
