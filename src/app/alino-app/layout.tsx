import { redirect } from "next/navigation";

import { getUser } from "@/lib/auth/actions";

import BlurredFx from "./components/blurredFx";
import { ConfigSection } from "./components/config-section";
import Navbar from "./components/navbar";

import styles from "./layout.module.css";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await getUser();
  if (result.error) {
    return redirect("/sign-in");
  }

  return (
    <section className={styles.app}>
      <BlurredFx />
      <div className={styles.appContainer}>
        <ConfigSection
          userAvatarUrl={result.data?.user.user_metadata.avatar_url}
          name={result.data?.user.user_metadata.name}
        />
        <Navbar />
        <p
          style={{
            position: "absolute",
            right: "0",
            bottom: "0",
            backgroundColor: "#fff",
            borderRadius: "10px",
            padding: "5px 10px",
            fontSize: "12px",
            color: "#1c1c1c",
            opacity: "0.5",
          }}
        >
          pre-alpha version
        </p>
        {children}
      </div>
    </section>
  );
}
