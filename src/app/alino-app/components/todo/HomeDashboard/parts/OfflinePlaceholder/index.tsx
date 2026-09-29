"use client";

import React from "react";
import styles from "./OfflinePlaceholder.module.css";

interface Props {
  widgetName?: string;
  reason?: string;
}

const WifiOffIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" strokeWidth="2" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" strokeWidth="2" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" strokeWidth="2" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" strokeWidth="2" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" strokeWidth="2" />
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="2.5" />
  </svg>
);

export const OfflinePlaceholder = ({ widgetName, reason }: Props) => {
  return (
    <div className={styles.placeholder}>
      <div className={styles.iconWrapper}>
        <WifiOffIcon className={styles.icon} />
      </div>
      <h3 className={styles.title}>Sin conexión a internet</h3>
      <p className={styles.text}>
        {reason || (widgetName
          ? `Este widget requiere conexión para sincronizar ${widgetName.toLowerCase()}.`
          : "Este widget requiere conexión a internet para funcionar.")}
      </p>
    </div>
  );
};
