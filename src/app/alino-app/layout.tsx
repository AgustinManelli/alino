import { redirect } from "next/navigation";
import { createClient as createClientServer } from "@/utils/supabase/server";

import { getUser } from "@/lib/auth/actions";

import TopBlurEffect from "@/components/ui/top-blur-effect";

import styles from "./layout.module.css";
import AppContent from "./app-content";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getUser();
  if (result.error || !result.data?.user) {
    return redirect("/sign-in");
  }

  const userId = result.data.user.id;

  const supabase = createClientServer();
  const { data: userPrivate } = await supabase
    .from("user_private")
    .select("initial_username_prompt_shown")
    .eq("user_id", userId)
    .single();

  const initialPromptShown =
    userPrivate?.initial_username_prompt_shown ?? false;

  return (
    <section className={styles.app}>
      <TopBlurEffect />
      <AppContent
        initialPromptShown={initialPromptShown}
        user={result.data.user}
      >
        {children}
      </AppContent>
    </section>
  );
}
