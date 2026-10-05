import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getUser } from "@/lib/api/user/actions";
import { getLists } from "@/lib/api/list/actions";
import { UserStoreProvider } from "@/components/providers/UserStoreProvider";
import { type UserPreferences } from "@/store/useUserPreferencesStore";
import { SupportedLanguage } from "@/lib/i18n/types";

import { AppContent } from "./AppContent";
import { TopBlurEffect } from "@/components/ui/top-blur-effect";

import styles from "./AlinoAppLayout.module.css";

export default async function AlinoAppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const [userResult, listsResult] = await Promise.all([
    getUser(),
    getLists(),
  ]);

  if (userResult.error || !userResult.data?.user) {
    redirect("/sign-in");
  }

  const user = userResult.data.user;
  const cookieStore = cookies();

  const initialSidebarCollapsed =
    cookieStore.get("sidebar-collapsed")?.value === "true";

  const cookiePosition = cookieStore.get("sidebar-position")?.value as
    | "left"
    | "right"
    | undefined;

  const dbPrefs = user.user_private?.preferences as Partial<UserPreferences> | null;
  const initialSidebarPosition: "left" | "right" =
    cookiePosition ?? dbPrefs?.sidebarPosition ?? "left";

  const cookieLang = cookieStore.get("user-language")?.value as
    | SupportedLanguage
    | undefined;
  const initialLanguage: SupportedLanguage =
    (dbPrefs?.language as SupportedLanguage) ?? cookieLang ?? "es";

  return (
    <section className={styles.alinoAppLayoutContainer}>
      <TopBlurEffect />
      <UserStoreProvider
        user={user}
        initialSidebarCollapsed={initialSidebarCollapsed}
        initialSidebarPosition={initialSidebarPosition}
        initialLanguage={initialLanguage}
        initialListsData={listsResult?.data ?? null}
      >
        <AppContent>{children}</AppContent>
      </UserStoreProvider>
    </section>
  );
}
