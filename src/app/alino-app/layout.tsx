import Navbar from "./components/navbar/navbar";
import { redirect } from "next/navigation";
import { readUserGetUser } from "@/lib/auth/actions";

export default async function appLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { error } = await readUserGetUser();

  if (error) {
    return redirect("/sign-in");
  }
  return (
    <section
      style={{
        position: "relative",
        backgroundColor: "rgb(240, 240, 240)",
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "row",
      }}
    >
      <Navbar />
      {children}
    </section>
  );
}
