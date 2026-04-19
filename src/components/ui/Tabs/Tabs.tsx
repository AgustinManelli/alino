"use client";

import React from "react";
import { motion } from "motion/react";
import styles from "./Tabs.module.css";

export interface TabOption {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
}


interface TabsProps {
  options: TabOption[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
  disabled?: boolean;
}

export const Tabs: React.FC<TabsProps> = ({
  options,
  activeTab,
  onChange,
  className,
  disabled,
}) => {
  return (
    <div
      className={`${styles.tabsContainer} ${className || ""} ${disabled ? styles.disabled : ""}`}
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
                layoutId="active-tab"
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
