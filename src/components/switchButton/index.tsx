"use client";

import { motion } from "motion/react";

interface props {
  value: boolean;
  action: () => void;
  width: number;
}

export function SwitchButton({ value, action, width }: props) {
  const toggleSwitch = () => action();

  return (
    <button
      style={{
        position: "relative",
        aspectRatio: "1.5 / 1",
        height: `${width / 1.5}px`,
        borderRadius: 50,
        cursor: "pointer",
        display: "flex",
        border: "none",
        justifyContent: "flex-" + (value ? "end" : "start"),
        width: `${width}px`,
        padding: `${width / 20}px`,
        backgroundColor: value ? "rgb(41, 204, 0)" : "rgb(230, 230, 230)",
      }}
      onClick={toggleSwitch}
    >
      <motion.div
        layout
        style={{
          width: "auto",
          height: "100%",
          aspectRatio: "1 / 1",
          backgroundColor: "#fff",
          borderRadius: "50%",
        }}
        transition={{
          type: "spring",
          visualDuration: 0.2,
          bounce: 0.2,
        }}
      />
    </button>
  );
}
