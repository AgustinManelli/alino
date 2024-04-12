"use server";

import { createClient } from "../../utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function readUserSession() {
  noStore();
  const supabase = await createClient();
  return await supabase.auth.getSession();
}
