"use server";

import { createClient } from "@/utils/supabase/server";
import { readUserSession } from "../auth/actions";
import { unstable_noStore as noStore } from "next/cache";

export async function GetSubjects() {
  const supabase = await createClient();
  const { data } = await readUserSession();

  const result = await supabase
    .from("subjects")
    .select("*")
    .order("inserted_at", { ascending: true })
    .eq("user_id", data.session?.user.id);
  return result;
}

export const AddSubjectToDB = async (subject: string, color: string) => {
  noStore();
  if (color === "") {
    var setColor = "#87189d";
  } else {
    var setColor = color;
  }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
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
  return error;
};

export const DeleteSubjectToDB = async (id: string) => {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  if (!error) {
    if (data.session) {
      const user = data.session.user;
      const result = await supabase.from("subjects").delete().eq("id", id);
      return result;
    }
  }
  return error;
};
