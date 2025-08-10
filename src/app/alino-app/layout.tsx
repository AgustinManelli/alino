import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth/actions";

import TopBlurEffect from "@/components/ui/top-blur-effect";
import { ConfigSection } from "./components/config-section";
import Sidebar from "./components/sidebar";

import styles from "./layout.module.css";
import { NotificationsSection } from "./components/notifications";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getUser();
  if (result.error || !result.data?.user) {
    return redirect("/sign-in");
  }

  return (
    <section className={styles.app}>
      <TopBlurEffect />

      <div className={styles.appContainer}>
        <ConfigSection
          name={result.data?.user.user_metadata.name}
          userAvatarUrl={result.data?.user.user_metadata.avatar_url}
        />
        <NotificationsSection />
        <Sidebar />
        {children}
      </div>
    </section>
  );
}
