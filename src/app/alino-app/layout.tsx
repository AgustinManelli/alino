import Navbar from "./components/navbar";
import { redirect } from "next/navigation";
import ConfigSection from "./components/config-section/config-section";
import BlurredFx from "./components/blurredFx";
import { createClient } from "@/utils/supabase/server";
import { readUserSession } from "@/lib/auth/actions";
import WindowComponent from "@/components/windowComponent";
import AccountConfigSection from "./components/accountConfigSection";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const {
    data: { session },
  } = await readUserSession();
  if (!session) {
    return redirect("/sign-in");
  }

  return (
    <section
      id="app"
      style={{
        position: "relative",
        backgroundColor: "rgb(240, 240, 240)",
        width: "100vw",
        height: "100svh",
        display: "flex",
        flexDirection: "row",
        overflow: "hidden",
        overflowY: "hidden",
      }}
    >
      <BlurredFx />
      <Navbar />
      <ConfigSection
        userAvatarUrl={session?.user?.user_metadata?.avatar_url}
        name={session?.user?.user_metadata.name}
      />
      <p
        style={{
          position: "absolute",
          right: "25px",
          bottom: "25px",
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
    </section>
  );
}
