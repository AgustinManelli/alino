import { getUser } from "@/lib/api/actions";

import { AppContent } from "./AppContent";
import { TopBlurEffect } from "@/components/ui/top-blur-effect";

import styles from "./AlinoAppLayout.module.css";

export default async function AlinoAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const userPrivateResult = await getUser();

  return (
    <section className={styles.alinoAppLayoutContainer}>
      <TopBlurEffect />
      <AppContent user={userPrivateResult.data?.user}>{children}</AppContent>
    </section>
  );
}
