"use client";
import { memo } from "react";
import styles from "./ConfigCard.module.css";
import { ChevronDown } from "../../icons/icons";

interface Props {
  name: string;
  icon: React.ReactNode;
  action?: () => void;
  hasChildren?: boolean;
  isActive?: boolean;
  variant?: "default" | "critical";
}

export const ConfigCard = memo(function ConfigCard({
  name,
  icon,
  action,
  hasChildren = false,
  isActive = false,
  variant = "default",
}: Props) {
  const isCritical = variant === "critical";
  return (
    <button
      type="button"
      className={`${styles.options} ${isActive ? styles.active : ""} ${
        isCritical ? styles.critical : ""
      }`}
      style={{ cursor: hasChildren ? "default" : "pointer" }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        if (hasChildren) return;
        action?.();
      }}
    >
      {icon}
      <p>{name}</p>
      {hasChildren && (
        <ChevronDown
          style={{
            width: "16px",
            height: "auto",
            stroke: "var(--text)",
            strokeWidth: 2,
            transform: "rotate(-90deg)",
          }}
        />
      )}
    </button>
  );
});
