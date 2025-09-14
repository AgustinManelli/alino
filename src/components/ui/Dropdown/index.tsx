"use client";

import React, {
  useState,
  ReactNode,
  useRef,
  createContext,
  useContext,
  useCallback,
} from "react";
import { motion, AnimatePresence } from "motion/react";
import { useModalUbication } from "@/hooks/useModalUbication";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import styles from "./Dropdown.module.css";

// Context para compartir estado entre componentes
interface DropdownContextType {
  isOpen: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  containerRef: React.RefObject<HTMLDivElement>;
  toggleDropdown: () => void;
  closeDropdown: () => void;
}

const DropdownContext = createContext<DropdownContextType | null>(null);

const useDropdownContext = (): DropdownContextType => {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown");
  }
  return context;
};

// Componente principal Dropdown
interface DropdownProps {
  children: ReactNode;
  side?: boolean;
  onClose?: () => void;
}

export const Dropdown = ({
  children,
  side = false,
  onClose,
}: DropdownProps): JSX.Element => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeDropdown = useCallback((): void => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggleDropdown = useCallback((): void => {
    setIsOpen((prev) => !prev);
  }, []);

  useModalUbication(triggerRef, containerRef, closeDropdown, side);

  const contextValue: DropdownContextType = {
    isOpen,
    triggerRef,
    containerRef,
    toggleDropdown,
    closeDropdown,
  };

  return (
    <DropdownContext.Provider value={contextValue}>
      {children}
    </DropdownContext.Provider>
  );
};

// Componente DropdownTrigger
interface DropdownTriggerProps {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
}

export const DropdownTrigger = ({
  children,
  style,
  className,
}: DropdownTriggerProps): JSX.Element => {
  const { isOpen, triggerRef, toggleDropdown } = useDropdownContext();

  return (
    <button
      ref={triggerRef}
      className={`${styles.triggerButton} ${className || ""}`}
      style={{
        backgroundColor: isOpen
          ? "var(--background-over-container-hover)"
          : "var(--background-over-container)",
        ...style,
      }}
      onClick={toggleDropdown}
    >
      {children}
    </button>
  );
};

// Componente DropdownContent
interface DropdownContentProps {
  children: ReactNode;
  className?: string;
}

export const DropdownContent = ({
  children,
  className,
}: DropdownContentProps): JSX.Element => {
  const { isOpen, containerRef } = useDropdownContext();

  return (
    <AnimatePresence mode="wait">
      <ClientOnlyPortal>
        {isOpen && (
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            className={`${styles.dropdownMenu} ${className || ""} ignore-sidebar-close`}
            ref={containerRef}
            id="dropdown-component"
          >
            <div className={`${styles.items} ignore-sidebar-close`}>
              {children}
            </div>
          </motion.section>
        )}
      </ClientOnlyPortal>
    </AnimatePresence>
  );
};

// Componente DropdownItem
interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const DropdownItem = ({
  children,
  onClick,
  className,
}: DropdownItemProps): JSX.Element => {
  const { closeDropdown } = useDropdownContext();

  const handleClick = (e: React.MouseEvent): void => {
    e.stopPropagation();
    onClick?.();
    closeDropdown();
  };

  return (
    <button
      className={`${styles.dropdownItem} ${className || ""}`}
      onClick={handleClick}
    >
      {children}
    </button>
  );
};

// Exportar todos los componentes
Dropdown.Trigger = DropdownTrigger;
Dropdown.Content = DropdownContent;
Dropdown.Item = DropdownItem;
