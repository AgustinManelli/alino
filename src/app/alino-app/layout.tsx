import Navbar from "./components/navbar";
import { redirect } from "next/navigation";
import { readUserGetUser } from "@/lib/auth/actions";
import ConfigSection from "./components/config-section/config-section";
import BlurredFx from "./components/blurredFx";
import Alerts from "./components/alerts";
import { createClient } from "@/utils/supabase/server";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const result = await readUserGetUser();
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session === null) {
    return redirect("/sign-in");
  }

  // if (result.error) {
  //   return redirect("/sign-in");
  // }

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
        userAvatarUrl={session.user?.user_metadata?.avatar_url}
        name={session.user?.user_metadata.name}
      />
      {/* <Alerts /> */}
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
