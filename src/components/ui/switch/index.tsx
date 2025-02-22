"use client";

import { motion, useAnimation } from "motion/react";
import { useState } from "react";

interface props {
  value: boolean;
  action: () => void;
  width: number;
}

export function Switch({ value, action, width = 40 }: props) {
  const [isPressed, setIsPressed] = useState(false);

  const toggleSwitch = () => action();

  const height = width * 0.6;
  const squeezed = (height - (width / 20) * 2) * 1.3;

  return (
    <motion.button
      style={{
        position: "relative",
        aspectRatio: "1.5 / 1",
        height: `${height}px`,
        borderRadius: `${width / 1.6 / 2}px`,
        cursor: "pointer",
        display: "flex",
        border: "none",
        justifyContent: "flex-" + (value ? "end" : "start"),
        width: `${width}px`,
        padding: `${width / 20}px`,
        backgroundColor: value
          ? "#2FD159"
          : "var(--background-over-container-hover)",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
      }}
      onClick={toggleSwitch}
      onTapStart={() => setIsPressed(true)}
      onTap={() => setIsPressed(false)}
      onTapCancel={() => setIsPressed(false)}
    >
      <motion.div
        layout
        style={{
          width: `${isPressed ? squeezed : height - (width / 20) * 2}px`,
          height: "100%",
          backgroundColor: "#fff",
          borderRadius: `${(width - width / 20) / 2}px`,
          boxShadow: "-5px 0px 10px rgb(0, 0, 0, 0.1)",
        }}
        transition={{
          type: "spring",
          visualDuration: 0.2,
          bounce: 0.2,
        }}
      />
    </motion.button>
  );
}
