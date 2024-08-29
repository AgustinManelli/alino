import Navbar from "./components/navbar";
import { redirect } from "next/navigation";
import { readUserGetUser } from "@/lib/auth/actions";
import ConfigSection from "./components/config-section/config-section";
import BlurredFx from "./components/blurredFx";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const result = await readUserGetUser();

  if (result.error) {
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
      <ConfigSection />
      {children}
    </section>
  );
}
