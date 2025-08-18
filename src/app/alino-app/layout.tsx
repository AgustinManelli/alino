import { redirect } from "next/navigation";

import { getUser as auth } from "@/lib/auth/actions";
import { getUser } from "@/lib/api/actions";

import AppContent from "./app-content";
import TopBlurEffect from "@/components/ui/top-blur-effect";

import styles from "./layout.module.css";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [userResult, userPrivateResult] = await Promise.all([
    auth(),
    getUser(),
  ]);

  if (userResult.error || !userResult.data?.user) {
    return redirect("/sign-in");
  }

  return (
    <section className={styles.app}>
      <TopBlurEffect />
      <AppContent user={userPrivateResult.data?.user}>{children}</AppContent>
    </section>
  );
}
