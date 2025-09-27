import { createBrowserClient } from "@supabase/ssr";
import { SupabaseClient } from "@supabase/supabase-js";

let supabase: SupabaseClient | null = null;

export const createClient = (): SupabaseClient => {
  if (supabase) {
    return supabase;
  }

  const newSupabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  newSupabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      newSupabase.realtime.setAuth(session.access_token);
    }
  });

  newSupabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      newSupabase.realtime.setAuth(session.access_token);
    }
  });

  supabase = newSupabase;
  return supabase;
};
