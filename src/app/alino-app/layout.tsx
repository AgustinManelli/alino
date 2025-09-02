import { getUser } from "@/lib/api/actions";

import { AppContent } from "./AppContent";
import { TopBlurEffect } from "@/components/ui/top-blur-effect";

import styles from "./AlinoAppLayout.module.css";
import { redirect } from "next/navigation";

export default async function AlinoAppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const userPrivateResult = await getUser();

  if (userPrivateResult.error) {
    redirect("/sign-in");
  }

  return (
    <section className={styles.alinoAppLayoutContainer}>
      <TopBlurEffect />
      <div className={styles.appContentContainer}>
        <AppContent user={userPrivateResult.data?.user} />
        {children}
      </div>
    </section>
  );
}
