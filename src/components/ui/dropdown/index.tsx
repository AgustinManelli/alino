"use client";

import { useState, ReactNode, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./Dropdown.module.css";
import { ClientOnlyPortal } from "../client-only-portal";
import { useModalUbication } from "@/hooks/useModalUbication";
interface DropdownProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  triggerLabel: () => ReactNode;
  selectedListHome: T | undefined;
  setSelectedListHome: (value: T) => void;
  handleFocusToParentInput?: () => void;
  boxSize?: number;
  directionContainerShow?: boolean;
  style?: React.CSSProperties;
}

export function Dropdown<T>({
  items,
  renderItem,
  triggerLabel,
  selectedListHome,
  setSelectedListHome,
  handleFocusToParentInput,
  boxSize = 30,
  directionContainerShow = false,
  style,
}: DropdownProps<T>) {
  const [open, setOpen] = useState<boolean>(false);

  const Ref = useRef<HTMLButtonElement>(null);
  const sRef = useRef<HTMLDivElement>(null);

  useModalUbication(
    Ref,
    sRef,
    () => {
      setOpen(false);
    },
    directionContainerShow
  );

  const toggleDropdown = () => setOpen(!open);
  const closeDropdown = () => setOpen(false);

  return (
    <>
      <button
        ref={Ref}
        className={styles.triggerButton}
        style={{
          height: `${boxSize}px`,
          width: `${boxSize}px`,
          aspectRatio: "1 / 1",
          backgroundColor: open
            ? "var(--background-over-container-hover)"
            : "var(--background-over-container)",
          ...style,
        }}
        onClick={toggleDropdown}
      >
        {triggerLabel()}
      </button>
      <ClientOnlyPortal>
        <AnimatePresence mode="wait">
          {open && (
            <motion.section
              initial={{
                opacity: 0,
                filter: "blur(10px)",
                z: -50,
                rotateX: 10,
                rotateY: -25,
              }}
              animate={{
                opacity: 1,
                filter: "blur(0px)",
                z: 0,
                rotateX: 0,
                rotateY: 0,
              }}
              exit={{
                opacity: 0,
                filter: "blur(10px)",
                z: -50,
                rotateX: 10,
                rotateY: -25,
              }}
              transition={{
                type: "spring",
                stiffness: 150,
                damping: 25,
                duration: 0.3,
              }}
              className={styles.dropdownMenu}
              ref={sRef}
              id="dropdown-component"
            >
              <div className={`${styles.items} ignore-sidebar-close`}>
                {items
                  .filter((item) => item !== selectedListHome)
                  .map((item, index) => (
                    <motion.button
                      key={`dropdown-index-${index}`}
                      className={styles.dropdownItem}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeDropdown();
                        setSelectedListHome(item);
                        handleFocusToParentInput && handleFocusToParentInput();
                      }}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{
                        delay: index * 0.05,
                        type: "spring",
                        stiffness: 100,
                        damping: 15,
                      }}
                    >
                      {renderItem(item, index)}
                    </motion.button>
                  ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </ClientOnlyPortal>
    </>
  );
}
