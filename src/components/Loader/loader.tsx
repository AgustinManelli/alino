"use client";

import { LoadingIcon } from "@/lib/ui/icons";
import { useLoaderStore } from "@/store/useLoaderStore";

const Loader = () => {
  const loading = useLoaderStore((state) => state.loading);

  if (!loading) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(255,255,255,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div>
        <LoadingIcon
          style={{
            width: "20px",
            height: "auto",
            stroke: "#1c1c1c",
            strokeWidth: "3",
          }}
        />
      </div>
    </div>
  );
};

export default Loader;
