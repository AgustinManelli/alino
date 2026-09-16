"use client";

import { motion } from "motion/react";
import React from "react";

interface Props {
  value: boolean;
  action: () => void;
  width?: number;
  disabled?: boolean;
}

export function Switch({ value, action, width = 40, disabled = false }: Props) {
  const height = width * 0.6;
  const padding = width / 20;
  const knobSize = height - padding * 2;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      action();
    }
  };

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      onClick={handleClick}
      whileTap={{ scale: disabled ? 1 : 0.92 }}
      style={{
        position: "relative",
        aspectRatio: "1.5 / 1",
        height: `${height}px`,
        borderRadius: `${height / 2}px`,
        cursor: disabled ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        border: "none",
        justifyContent: value ? "flex-end" : "flex-start",
        width: `${width}px`,
        padding: `${padding}px`,
        backgroundColor: value
          ? "#2FD159"
          : "var(--background-over-container-hover)",
        overflow: "hidden",
        WebkitTapHighlightColor: "transparent",
        touchAction: "manipulation",
        opacity: disabled ? "0.4" : "1",
        transition: "background-color 0.2s ease, opacity 0.2s ease",
      }}
    >
      <motion.div
        layout
        style={{
          width: `${knobSize}px`,
          height: `${knobSize}px`,
          backgroundColor: "#fff",
          borderRadius: "50%",
          boxShadow: "-1px 2px 4px rgba(0, 0, 0, 0.15)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 32,
        }}
      />
    </motion.button>
  );
}
