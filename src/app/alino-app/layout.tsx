import Navbar from "./components/navbar";
import { redirect } from "next/navigation";
import ConfigSection from "./components/config-section/config-section";
import BlurredFx from "./components/blurredFx";
import { readUserSession } from "@/lib/auth/actions";

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
        padding: "15px",
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
          right: "15px",
          bottom: "15px",
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
