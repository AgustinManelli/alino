"use client";

import React, { useRef, useState, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useModalUbication } from "@/hooks/useModalUbication";
import { ColorSwatch } from "../ColorSwatch";

import styles from "./HighlightColorPicker.module.css";

const HighlightIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 11-6 6v3h9l3-3" />
    <path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
  </svg>
);

const POPOVER_MOTION = {
  initial: { opacity: 0, scale: 0.9, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -4 },
  transition: { duration: 0.13 },
} as const;

export const HIGHLIGHT_COLORS = [
  { label: "Ninguno", value: null },
  { label: "Amarillo", value: "#fef08a" },
  { label: "Verde", value: "#bbf7d0" },
  { label: "Azul", value: "#bfdbfe" },
  { label: "Violeta", value: "#ddd6fe" },
  { label: "Rosa", value: "#fecaca" },
  { label: "Naranja", value: "#fed7aa" },
] as const;

interface HighlightColorPickerProps {
  activeHighlight: string | undefined;
  onSetHighlight: (val: string | null) => void;
}

export const HighlightColorPicker = memo(function HighlightColorPicker({
  activeHighlight,
  onSetHighlight,
}: HighlightColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setIsOpen(false);
  }, []);

  useModalUbication(
    triggerRef as React.RefObject<HTMLElement>,
    portalRef as React.RefObject<HTMLElement>,
    handleClose,
    false,
  );

  const toggleOpen = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((v) => !v);
  }, []);

  const handleSelect = useCallback(
    (val: string | null) => {
      onSetHighlight(val);
      setIsOpen(false);
    },
    [onSetHighlight],
  );

  const stopPropagation = useCallback(
    (e: React.MouseEvent | React.UIEvent) => e.stopPropagation(),
    [],
  );

  return (
    <div className={styles.pickerContainer}>
      <button
        ref={triggerRef}
        className={`${styles.colorTriggerBtn} ${activeHighlight ? styles.active : ""}`}
        onMouseDown={toggleOpen}
        title="Resaltar texto"
      >
        <span className={styles.iconWrapper}>
          <HighlightIcon />
        </span>
        <span
          className={styles.colorBar}
          style={{
            backgroundColor: activeHighlight ?? "transparent",
            border: !activeHighlight ? "1px solid var(--icon-color)" : "none",
            opacity: !activeHighlight ? 0.3 : 1,
          }}
        />
      </button>

      {createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={portalRef}
              className={`${styles.popover} color-picker-portal ignore-sidebar-close`}
              {...POPOVER_MOTION}
              onMouseDown={stopPropagation}
            >
              {HIGHLIGHT_COLORS.map((h) => (
                <ColorSwatch
                  key={h.label}
                  label={h.label}
                  value={h.value}
                  isSelected={
                    (activeHighlight === undefined && h.value === null) ||
                    activeHighlight === h.value
                  }
                  onSelect={handleSelect}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </div>
  );
});
