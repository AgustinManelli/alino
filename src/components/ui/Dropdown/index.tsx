"use client";

import { useState, ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useModalUbication } from "@/hooks/useModalUbication";
import { ClientOnlyPortal } from "../ClientOnlyPortal";

import styles from "./Dropdown.module.css";

interface DropdownProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  triggerLabel: () => ReactNode;
  setSelectedItem: (value: T) => void;
  handleFocusToParentInput?: () => void;
  side?: boolean;
  style?: React.CSSProperties;
}

export const Dropdown = <T,>({
  items,
  renderItem,
  triggerLabel,
  setSelectedItem,
  handleFocusToParentInput,
  side = false,
  style,
}: DropdownProps<T>) => {
  const [open, setOpen] = useState<boolean>(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useModalUbication(
    triggerRef,
    containerRef,
    () => {
      setOpen(false);
    },
    side
  );

  const toggleDropdown = () => setOpen((v) => !v);

  const closeDropdown = () => setOpen(false);

  const handleItemClick = (item: T) => {
    setSelectedItem(item);
    closeDropdown();
    handleFocusToParentInput?.();
  };

  return (
    <>
      <button
        className={styles.triggerButton}
        ref={triggerRef}
        style={{
          backgroundColor: open
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
          ...style,
        }}
        onClick={toggleDropdown}
      >
        {triggerLabel()}
      </button>
      <AnimatePresence mode="wait">
        <ClientOnlyPortal>
          {open && (
            <motion.section
              initial={{
                opacity: 0,
              }}
              animate={{
                opacity: 1,
              }}
              exit={{
                opacity: 0,
              }}
              transition={{ duration: 0.1 }}
              className={`${styles.dropdownMenu} ignore-sidebar-close`}
              ref={containerRef}
              id="dropdown-component"
            >
              <div className={`${styles.items} ignore-sidebar-close`}>
                {items.map((item, index) => (
                  <button
                    key={`dropdown-index-${index}`}
                    className={styles.dropdownItem}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleItemClick(item);
                    }}
                  >
                    {renderItem(item, index)}
                  </button>
                ))}
              </div>
            </motion.section>
          )}
        </ClientOnlyPortal>
      </AnimatePresence>
    </>
  );
};
