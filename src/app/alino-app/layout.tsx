import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { getUser } from "@/lib/api/user/actions";
import { UserStoreProvider } from "@/components/providers/UserStoreProvider";
import { type UserPreferences } from "@/store/useUserPreferencesStore";

import { AppContent } from "./AppContent";
import { TopBlurEffect } from "@/components/ui/top-blur-effect";

import styles from "./AlinoAppLayout.module.css";

export default async function AlinoAppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const userResult = await getUser();

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

  return (
    <section className={styles.alinoAppLayoutContainer}>
      <TopBlurEffect />
      <UserStoreProvider
        user={user}
        initialSidebarCollapsed={initialSidebarCollapsed}
        initialSidebarPosition={initialSidebarPosition}
      >
        <AppContent>{children}</AppContent>
      </UserStoreProvider>
    </section>
  );
}
