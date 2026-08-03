"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSidebarItemTooltip } from "@/hooks/useSidebarItemTooltip";
import styles from "./SidebarTooltip.module.css";

interface SidebarTooltipProps {
  label: string;
  children: (props: {
    triggerRef: React.RefObject<HTMLElement>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => React.ReactNode;
}

export const SidebarTooltip = ({ label, children }: SidebarTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useSidebarItemTooltip(
    triggerRef as React.RefObject<HTMLElement>,
    tooltipRef as React.RefObject<HTMLElement>,
    visible
  );

  const tooltip =
    mounted && typeof document !== "undefined"
      ? createPortal(
        <div
          ref={tooltipRef}
          className={`${styles.tooltip} ${visible ? styles.visible : ""}`}
          role="tooltip"
          aria-hidden={!visible}
        >
          <span className={styles.label}>{label}</span>
        </div>,
        document.body
      )
      : null;

  return (
    <>
      {children({
        triggerRef: triggerRef as React.RefObject<HTMLElement>,
        onMouseEnter: () => setVisible(true),
        onMouseLeave: () => setVisible(false),
      })}
      {tooltip}
    </>
  );
};
