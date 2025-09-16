import { HomeDashboard } from "./components/todo/HomeDashboard";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { DashboardData } from "@/lib/schemas/todo-schema";

export default async function HomePage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: dashboardData, error } = await supabase
    .from("user_dashboard_view")
    .select("*")
    .eq("user_id", user.id)
    .single<DashboardData>();

  if (error) return;

  return (
    <div style={Style}>
      <HomeDashboard data={dashboardData} />
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
