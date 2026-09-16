"use client";

import React from "react";
import { motion } from "motion/react";
import styles from "./Tabs.module.css";

export interface TabOption {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}


export interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  disabled?: boolean;
  layoutId?: string;
  style?: React.CSSProperties;
  backgroundColor?: string;
  indicatorColor?: string;
  indicatorHoverColor?: string;
  indicatorShadow?: string;
  textColor?: string;
  activeTextColor?: string;
  hoverTextColor?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  options,
  activeTab,
  onChange,
  className,
  disabled,
  layoutId = "active-tab",
  style,
  backgroundColor,
  indicatorColor,
  indicatorHoverColor,
  indicatorShadow,
  textColor,
  activeTextColor,
  hoverTextColor,
}) => {
  const dynamicStyles: React.CSSProperties = {
    ...(backgroundColor ? { ["--tabs-bg" as string]: backgroundColor } : {}),
    ...(indicatorColor ? { ["--tabs-indicator-bg" as string]: indicatorColor } : {}),
    ...(indicatorHoverColor ? { ["--tabs-indicator-hover-bg" as string]: indicatorHoverColor } : {}),
    ...(indicatorShadow ? { ["--tabs-indicator-shadow" as string]: indicatorShadow } : {}),
    ...(textColor ? { ["--tabs-text-color" as string]: textColor } : {}),
    ...(activeTextColor ? { ["--tabs-active-text-color" as string]: activeTextColor } : {}),
    ...(hoverTextColor ? { ["--tabs-hover-text-color" as string]: hoverTextColor } : {}),
    ...style,
  };

  return (
    <div
      className={`${styles.tabsContainer} ${className || ""} ${disabled ? styles.disabled : ""}`}
      style={dynamicStyles}
    >
      {options.map((option) => {
        const isActive = activeTab === option.id;

        return (
          <button
            key={option.id}
            className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
            onClick={() => !disabled && onChange(option.id)}
            type="button"
            disabled={disabled}
          >
            {option.icon && <span className={styles.icon}>{option.icon}</span>}
            <span className={styles.label}>{option.label}</span>
            {isActive && (
              <motion.div
                layoutId={layoutId}
                className={styles.activeIndicator}
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
