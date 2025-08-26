import { createBrowserClient } from "@supabase/ssr";

export const createClient = () => {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Adjuntar token de usuario activo
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      supabase.realtime.setAuth(session.access_token);
    }
  });

  // Actualizar token si la sesión cambia
  supabase.auth.onAuthStateChange((_event, session) => {
    if (session) {
      supabase.realtime.setAuth(session.access_token);
    }
  });

  return supabase;
};
