"use server";

import { createClient } from "../../utils/supabase/server";
import { unstable_noStore as noStore } from "next/cache";

export async function readUserSession() {
  noStore();
  const supabsae = await createClient();
  return await supabsae.auth.getSession();
}
