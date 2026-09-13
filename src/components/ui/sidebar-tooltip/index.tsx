"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useSidebarItemTooltip } from "@/hooks/useSidebarItemTooltip";
import styles from "./SidebarTooltip.module.css";

interface SidebarTooltipProps {
  label: string;
  enabled?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
  children: (props: {
    triggerRef: React.RefObject<HTMLElement>;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  }) => React.ReactNode;
}

export const SidebarTooltip = ({
  label,
  children,
  enabled = true,
  containerRef,
}: SidebarTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setVisible(false);
  }, [enabled]);

  useSidebarItemTooltip(
    triggerRef as React.RefObject<HTMLElement>,
    tooltipRef as React.RefObject<HTMLElement>,
    visible && enabled,
    containerRef
  );

  const tooltip =
    mounted && enabled && typeof document !== "undefined"
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
        onMouseEnter: () => {
          if (enabled) setVisible(true);
        },
        onMouseLeave: () => {
          setVisible(false);
        },
      })}
      {tooltip}
    </>
  );
};
