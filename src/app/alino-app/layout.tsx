import { redirect } from "next/navigation";
import { createClient as createClientServer } from "@/utils/supabase/server";

import { getUser } from "@/lib/auth/actions";

import AppContent from "./app-content";
import TopBlurEffect from "@/components/ui/top-blur-effect";

import styles from "./layout.module.css";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userResult, userPrivateResult] = await Promise.all([
    getUser(),
    (async () => {
      const supabase = createClientServer();
      const {
        data: { user },
      } = await getUser();
      if (!user) return { data: null };
      return supabase
        .from("user_private")
        .select("initial_username_prompt_shown")
        .eq("user_id", user.id)
        .single();
    })(),
  ]);

  if (userResult.error || !userResult.data?.user) {
    return redirect("/sign-in");
  }

  const { user } = userResult.data;

  const initialPromptShown =
    userPrivateResult.data?.initial_username_prompt_shown ?? false;

  return (
    <section className={styles.app}>
      <TopBlurEffect />
      <AppContent initialPromptShown={initialPromptShown} user={user}>
        {children}
      </AppContent>
    </section>
  );
}
