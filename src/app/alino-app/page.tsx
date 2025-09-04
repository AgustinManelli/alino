"use client";

import { Manager } from "@/app/alino-app/components/todo/manager";

export default function HomePage() {
  return (
    <div style={Style}>
      <Manager h />
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
} as React.CSSProperties;
