import { HomeDashboard } from "./components/todo/HomeDashboard";
import { redirect } from "next/navigation";
import { getSummary } from "@/lib/api/actions";

export default async function HomePage() {
  const summary = await getSummary();

  if (summary.error) {
    redirect("/sign-in");
  }

  return (
    <div style={Style}>
      <HomeDashboard data={summary.data?.summary} />
    </div>
  );
}

const Style = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  gap: "20px",
  overflow: "hidden",
} as React.CSSProperties;
