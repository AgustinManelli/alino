import { Manager } from "@/app/alino-app/components/todo/manager";

const style = {
  width: "100%",
  height: "100%",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
} as React.CSSProperties;

export default function HomePage() {
  return (
    <div style={style}>
      <Manager h />
    </div>
  );
}
