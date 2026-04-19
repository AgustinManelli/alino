"use client";

import React, { useRef, useState, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";

import { useModalUbication } from "@/hooks/useModalUbication";
import { ColorSwatch } from "../ColorSwatch";

import styles from "./TextColorPicker.module.css";

const POPOVER_MOTION = {
  initial: { opacity: 0, scale: 0.9, y: -4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -4 },
  transition: { duration: 0.13 },
} as const;

export const TEXT_COLORS = [
  { label: "Default", value: null },
  { label: "Rojo", value: "#ef4444" },
  { label: "Naranja", value: "#f97316" },
  { label: "Amarillo", value: "#ca8a04" },
  { label: "Verde", value: "#16a34a" },
  { label: "Azul", value: "#2563eb" },
  { label: "Violeta", value: "#7c3aed" },
  { label: "Rosa", value: "#db2777" },
  { label: "Gris", value: "#6b7280" },
] as const;

interface TextColorPickerProps {
  activeColor: string | undefined;
  onSetColor: (val: string | null) => void;
}

export const TextColorPicker = memo(function TextColorPicker({
  activeColor,
  onSetColor,
}: TextColorPickerProps) {
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
      onSetColor(val);
      setIsOpen(false);
    },
    [onSetColor],
  );

  const stopPropagation = useCallback(
    (e: React.MouseEvent | React.UIEvent) => e.stopPropagation(),
    [],
  );

  return (
    <div className={styles.pickerContainer}>
      <button
        ref={triggerRef}
        className={`${styles.colorTriggerBtn} ${activeColor ? styles.active : ""}`}
        onMouseDown={toggleOpen}
        title="Color de texto"
      >
        <span className={styles.colorLabel}>A</span>
        <span
          className={styles.colorBar}
          style={{ backgroundColor: activeColor ?? "var(--text)" }}
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
              {TEXT_COLORS.map((c) => (
                <ColorSwatch
                  key={c.label}
                  label={c.label}
                  value={c.value}
                  isSelected={
                    (activeColor === undefined && c.value === null) ||
                    activeColor === c.value
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
