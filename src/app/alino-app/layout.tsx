import { readUserSession } from "@/lib/auth/actions";
import Navbar from "./components/navbar/navbar";

export default function appLayout({ children }: { children: React.ReactNode }) {
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
