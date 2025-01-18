"use client";

interface props {
  children?: React.ReactNode;
}
export default function ContainerConfig({ children }: props) {
  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: "25px",
      }}
    >
      {children}
    </div>
  );
}
