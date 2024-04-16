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
    .order("id", { ascending: true })
    .eq("user_id", data.session?.user.id);
  return result;
}

export const AddSubjectToDB = async (subject: string) => {
  noStore();
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getSession();
  if (!error) {
    const user = data.session.user;
    const result = await supabase
      .from("subjects")
      .insert({ subject, user_id: user.id })
      .select()
      .single();
    return result;
  }
};
