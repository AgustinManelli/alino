import { redirect } from "next/navigation";

import { getUser } from "@/lib/api/user/actions";
import { AppContent } from "./AppContent";
import { TopBlurEffect } from "@/components/ui/top-blur-effect";
import { UserStoreProvider } from "@/components/providers/UserStoreProvider"; // Importar Provider

import styles from "./AlinoAppLayout.module.css";

export default async function AlinoAppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const userPrivateResult = await getUser();

  if (userPrivateResult.error || !userPrivateResult.data?.user) {
    redirect("/sign-in");
  }

  const user = userPrivateResult.data.user;

  return (
    <section className={styles.alinoAppLayoutContainer}>
      <TopBlurEffect />
      <UserStoreProvider user={user}>
        <div className={styles.appContentContainer}>
          <AppContent user={user}>{children}</AppContent>
        </div>
      </UserStoreProvider>
    </section>
  );
}
