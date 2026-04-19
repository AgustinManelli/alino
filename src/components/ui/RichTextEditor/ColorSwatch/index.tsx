"use client";

import React, { memo, useCallback, useState } from "react";

import { SquircleIcon } from "@/components/ui/icons/icons";

import styles from "./ColorSwatch.module.css";

export interface SwatchProps {
  label: string;
  value: string | null;
  isSelected: boolean;
  onSelect: (val: string | null) => void;
}

export const ColorSwatch = memo(function ColorSwatch({
  label,
  value,
  isSelected,
  onSelect,
}: SwatchProps) {
  const [hoverColor, setHoverColor] = useState<boolean>(false);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onSelect(value);
    },
    [value, onSelect],
  );

  const handleMouseEnter = useCallback(() => setHoverColor(true), []);
  const handleMouseLeave = useCallback(() => setHoverColor(false), []);

  return (
    <div className={styles.buttonContainer}>
      <button
        className={styles.button}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        title={label}
      >
        <SquircleIcon
          style={{
            fill: value ?? "transparent",
            stroke: !value ? "var(--icon-color)" : "none",
            strokeWidth: !value ? "1.5" : "0",
            strokeDasharray: !value ? "3,3" : "none",
            width: "18px",
            opacity: !value ? 0.5 : 1,
          }}
        />
        <SquircleIcon
          style={{
            fill: "transparent",
            position: "absolute",
            width: "30px",
            strokeWidth: "1.5",
            stroke: isSelected
              ? (value ?? "var(--icon-color)")
              : hoverColor
                ? (value ?? "var(--icon-color)")
                : "var(--border-container-color)",
            transition: "stroke 0.3s ease-in-out",
          }}
        />
      </button>
    </div>
  );
});
