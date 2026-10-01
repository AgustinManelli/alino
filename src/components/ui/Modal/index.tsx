"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import { Cross } from "@/components/ui/icons/icons";
import styles from "./Modal.module.css";

interface ModalStackEntry {
  id: string;
  close: () => void;
  closeOnEsc: boolean;
}

const modalStack: ModalStackEntry[] = [];
let initialBodyOverflow: string | null = null;
let initialBodyPaddingRight: string | null = null;

interface ModalContextType {
  onClose: () => void;
  isOpen: boolean;
}

const ModalContext = createContext<ModalContextType | null>(null);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("Modal compound components must be used within a Modal");
  }
  return context;
};

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string | number;
  width?: string | number;
  maxHeight?: string | number;
  height?: string | number;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  style?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
  closeOnOverlayClick?: boolean;
  closeOnEsc?: boolean;
  bgBlur?: boolean;
  id?: string;
  ariaLabel?: string;
}

export interface ModalHeaderProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  leftSlot?: React.ReactNode;
  rightSlot?: React.ReactNode;
  showCloseButton?: boolean;
  onClose?: () => void;
  bordered?: boolean;
  className?: string;
  style?: React.CSSProperties;
  closeButtonAriaLabel?: string;
}

export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  noPadding?: boolean;
  scrollable?: boolean;
}

export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  bordered?: boolean;
}

export interface ModalCloseButtonProps {
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

export interface ModalTitleProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function ModalCloseButton({
  onClick,
  className,
  style,
  ariaLabel = "Cerrar modal",
}: ModalCloseButtonProps) {
  const context = useContext(ModalContext);
  const handleClose = onClick || context?.onClose;

  return (
    <button
      type="button"
      className={`${styles.closeButton} ${className || ""}`}
      style={style}
      onClick={handleClose}
      aria-label={ariaLabel}
    >
      <Cross className={styles.closeIcon} />
    </button>
  );
}

export function ModalTitle({ children, className, style }: ModalTitleProps) {
  return (
    <h2 className={`${styles.title} ${className || ""}`} style={style}>
      {children}
    </h2>
  );
}

export function ModalHeader({
  children,
  title,
  subtitle,
  leftSlot,
  rightSlot,
  showCloseButton = true,
  onClose,
  bordered = true,
  className,
  style,
  closeButtonAriaLabel,
}: ModalHeaderProps) {
  const context = useContext(ModalContext);
  const handleClose = onClose || context?.onClose;

  return (
    <header
      className={`${styles.header} ${bordered ? styles.headerBordered : ""} ${className || ""}`}
      style={style}
    >
      {children ? (
        children
      ) : (
        <>
          <div className={styles.headerLeft}>
            {leftSlot}
            {(title || subtitle) && (
              <div className={styles.titleArea}>
                {typeof title === "string" ? (
                  <h2 className={styles.title}>{title}</h2>
                ) : (
                  title
                )}
                {typeof subtitle === "string" ? (
                  <p className={styles.subtitle}>{subtitle}</p>
                ) : (
                  subtitle
                )}
              </div>
            )}
          </div>
          <div className={styles.headerRight}>
            {rightSlot}
            {showCloseButton && (
              <ModalCloseButton
                onClick={handleClose}
                ariaLabel={closeButtonAriaLabel}
              />
            )}
          </div>
        </>
      )}
    </header>
  );
}

export function ModalBody({
  children,
  className,
  style,
  noPadding = false,
  scrollable = true,
}: ModalBodyProps) {
  const content = (
    <div
      className={`${styles.body} ${!noPadding ? styles.bodyPadded : ""} ${className || ""}`}
      style={style}
    >
      {children}
    </div>
  );

  if (scrollable) {
    return (
      <SimpleBar autoHide={true} className={styles.scrollContainer}>
        {content}
      </SimpleBar>
    );
  }

  return content;
}

export function ModalFooter({
  children,
  className,
  style,
  bordered = true,
}: ModalFooterProps) {
  return (
    <footer
      className={`${styles.footer} ${bordered ? styles.footerBordered : ""} ${className || ""}`}
      style={style}
    >
      {children}
    </footer>
  );
}

export function Modal({
  isOpen,
  onClose,
  children,
  maxWidth = "880px",
  width = "92%",
  maxHeight = "90vh",
  height,
  className,
  overlayClassName,
  contentClassName,
  style,
  overlayStyle,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  bgBlur = false,
  id = "generic-modal",
  ariaLabel,
}: ModalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const modalRef = useRef<HTMLElement | null>(null);
  const fallbackElRef = useRef<HTMLElement | null>(null);

  const overlayPointerDownTarget = useRef<EventTarget | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (modalStack.length === 0) {
      initialBodyOverflow = document.body.style.overflow;
      initialBodyPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    const entry: ModalStackEntry = { id, close: onClose, closeOnEsc };
    modalStack.push(entry);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const top = modalStack[modalStack.length - 1];
        if (top && top.id === id && top.closeOnEsc) {
          e.stopPropagation();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      const index = modalStack.indexOf(entry);
      if (index !== -1) {
        modalStack.splice(index, 1);
      }
      if (modalStack.length === 0) {
        document.body.style.overflow = initialBodyOverflow ?? "";
        document.body.style.paddingRight = initialBodyPaddingRight ?? "";
        initialBodyOverflow = null;
        initialBodyPaddingRight = null;
      }
    };
  }, [isOpen, id, onClose, closeOnEsc]);

  useEffect(() => {
    const existing = document.getElementById("portal-root");
    if (existing) {
      setContainer(existing);
      return;
    }

    const el = document.createElement("div");
    el.setAttribute("id", `portal-root-fallback-${id}`);
    document.body.appendChild(el);
    fallbackElRef.current = el;
    setContainer(el);

    return () => {
      if (fallbackElRef.current && fallbackElRef.current.parentNode) {
        fallbackElRef.current.parentNode.removeChild(fallbackElRef.current);
      }
    };
  }, [id]);

  const handleOverlayPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    overlayPointerDownTarget.current = e.target;
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (
      closeOnOverlayClick &&
      e.target === e.currentTarget &&
      overlayPointerDownTarget.current === e.currentTarget
    ) {
      onClose();
    }
  };

  if (!container) return null;

  const modalStyle: React.CSSProperties = {
    maxWidth,
    width,
    maxHeight,
    ...(height ? { height } : {}),
    ...(style || {}),
  };

  return createPortal(
    <ModalContext.Provider value={{ isOpen, onClose }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key={`modal-overlay-${id}`}
            id={`modal-overlay-${id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerDown={handleOverlayPointerDown}
            onClick={handleOverlayClick}
            className={`${styles.overlay} ${overlayClassName || ""}`}
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              backdropFilter: "blur(4px)",
              ...(overlayStyle || {}),
            }}
          >
            {bgBlur && (
              <motion.div
                className={styles.glow}
                initial={{ scale: 0, rotate: 0 }}
                animate={{
                  scale: [1, 1.05, 0.95, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  rotate: {
                    duration: 30,
                    repeat: Infinity,
                    ease: "linear",
                  },
                  scale: {
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                  },
                  delay: 0.2,
                }}
              >
                <Image
                  src="/circle-blur.webp"
                  alt="blur circle"
                  fill
                  style={{
                    objectFit: "contain",
                    pointerEvents: "none",
                    userSelect: "none",
                  }}
                />
              </motion.div>
            )}

            <motion.section
              ref={modalRef as React.RefObject<HTMLDivElement>}
              role="dialog"
              aria-modal="true"
              aria-label={ariaLabel}
              key={`modal-content-${id}`}
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
              className={`${styles.modal} ${contentClassName || ""} ${className || ""}`}
              style={modalStyle}
            >
              {children}
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>,
    container,
  );
}

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
Modal.Title = ModalTitle;
Modal.CloseButton = ModalCloseButton;
