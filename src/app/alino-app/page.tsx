import { HomeDashboard } from "./components/todo/HomeDashboard";

export default function HomePage() {
  return (
    <div style={Style}>
      <HomeDashboard />
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
