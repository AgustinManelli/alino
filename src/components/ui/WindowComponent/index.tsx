"use client";

import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import Image from "next/image";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { Cross, ArrowLeft, ChevronDown } from "@/components/ui/icons/icons";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import styles from "./WindowComponent.module.css";

interface WindowContextType {
  isMobileView: boolean;
  mobileView: "menu" | "content";
  goToMenu: () => void;
  goToContent: () => void;
  activeItemTitle: string;
  setActiveItemTitle: React.Dispatch<React.SetStateAction<string>>;
}

const WindowContext = createContext<WindowContextType | null>(null);

export interface WindowSidebarProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  layoutId?: string;
}

export interface WindowSidebarItemProps {
  id?: string;
  label: string;
  icon?: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  badge?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function WindowSidebar({
  children,
  className,
  style,
}: WindowSidebarProps) {
  const context = useContext(WindowContext);
  const isMobileView = context?.isMobileView ?? false;
  const goToContent = context?.goToContent;
  const setActiveItemTitle = context?.setActiveItemTitle;

  const items = (React.Children.toArray(children).filter(
    React.isValidElement,
  ) as unknown) as React.ReactElement<WindowSidebarItemProps>[];

  const activeIndex = items.findIndex((item) => item.props.active);
  const activeItem = activeIndex >= 0 ? items[activeIndex] : null;

  useEffect(() => {
    if (activeItem?.props.label && setActiveItemTitle) {
      setActiveItemTitle(activeItem.props.label);
    }
  }, [activeItem?.props.label, setActiveItemTitle]);

  if (isMobileView) {
    return (
      <div className={styles.mobileMenuContainer}>
        <div className={styles.mobileMenuList}>
          {items.map((item, idx) => {
            const isItemActive = Boolean(item.props.active);
            return (
              <motion.button
                key={item.props.id || item.props.label || idx}
                type="button"
                whileTap={{ scale: 0.98 }}
                className={`${styles.mobileMenuItem} ${
                  isItemActive ? styles.mobileMenuItemActive : ""
                }`}
                onClick={() => {
                  item.props.onClick?.();
                  if (setActiveItemTitle) {
                    setActiveItemTitle(item.props.label);
                  }
                  if (goToContent) {
                    goToContent();
                  }
                }}
              >
                <div className={styles.mobileMenuItemLeft}>
                  {item.props.icon && (
                    <span className={styles.mobileMenuItemIcon}>
                      {item.props.icon}
                    </span>
                  )}
                  <span className={styles.mobileMenuItemLabel}>
                    {item.props.label}
                  </span>
                </div>
                <div className={styles.mobileMenuItemRight}>
                  {item.props.badge && (
                    <span className={styles.mobileMenuItemBadge}>
                      {item.props.badge}
                    </span>
                  )}
                  <ChevronDown className={styles.mobileMenuItemChevron} />
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <nav
      className={`${styles.windowSidebarNav} ${className || ""}`}
      style={style}
    >
      {children}
    </nav>
  );
}

export function WindowSidebarItem({
  label,
  icon,
  active = false,
  onClick,
  badge,
  className,
  style,
}: WindowSidebarItemProps) {
  return (
    <button
      type="button"
      className={`${styles.sidebarItem} ${
        active ? styles.sidebarItemActive : ""
      } ${className || ""}`}
      onClick={onClick}
      style={style}
    >
      <span className={styles.sidebarItemMain}>
        {icon && <span className={styles.sidebarItemIcon}>{icon}</span>}
        <span className={styles.sidebarItemLabel}>{label}</span>
      </span>
      {badge && <span className={styles.sidebarItemBadge}>{badge}</span>}
    </button>
  );
}

interface WindowComponentProps {
  children?: React.ReactNode;
  windowTitle?: string;
  closeAction?: boolean;
  adaptative?: React.CSSProperties;
  bgBlur?: boolean;
  id?: string;
  crossAction?: () => void;
  sidebar?: React.ReactNode;
  maxWidth?: string | number;
}

export function WindowComponent({
  children,
  windowTitle = "window_title",
  closeAction = true,
  adaptative,
  bgBlur = false,
  id = "default",
  crossAction = () => { },
  sidebar,
  maxWidth,
}: WindowComponentProps) {
  const windowRef = useRef<HTMLElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const createdRef = useRef<HTMLElement | null>(null);

  const platformMobile = usePlatformInfoStore((state) => state.isMobile);
  const [isWindowMobile, setIsWindowMobile] = useState(false);
  const [mobileView, setMobileView] = useState<"menu" | "content">("menu");
  const [direction, setDirection] = useState<number>(1);
  const [activeItemTitle, setActiveItemTitle] = useState<string>("");

  useEffect(() => {
    const check = () => {
      setIsWindowMobile(window.innerWidth <= 850);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isMobileView = Boolean(platformMobile || isWindowMobile);

  const goToMenu = () => {
    setDirection(-1);
    setMobileView("menu");
  };

  const goToContent = () => {
    setDirection(1);
    setMobileView("content");
  };

  const handleClose = () => {
    goToMenu();
    crossAction();
  };

  useOnClickOutside(
    windowRef as React.RefObject<HTMLElement>,
    () => {
      handleClose();
    },
    [],
    "ignore-sidebar-close",
  );

  useEffect(() => {
    const existing = document.getElementById("portal-root");
    if (existing) {
      setContainer(existing);
      return;
    }

    const el = document.createElement("div");
    el.setAttribute("id", `portal-root-fallback-${id}`);
    document.body.appendChild(el);
    createdRef.current = el;
    setContainer(el);

    return () => {
      if (createdRef.current && createdRef.current.parentNode) {
        createdRef.current.parentNode.removeChild(createdRef.current);
      }
    };
  }, [id]);

  if (!container) {
    return null;
  }

  const modalStyle: React.CSSProperties = {
    ...(maxWidth ? { maxWidth } : {}),
    ...(adaptative || {}),
  };

  const modalClassName = `${styles.windowModal} ${
    sidebar ? styles.windowModalWithSidebar : ""
  }`;

  return createPortal(
    <WindowContext.Provider
      value={{
        isMobileView,
        mobileView,
        goToMenu,
        goToContent,
        activeItemTitle,
        setActiveItemTitle,
      }}
    >
      <motion.div
        key={`window-component-${id}`}
        id={`window-component-${id}`}
        initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        animate={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
        exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={styles.windowContainer}
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
              delay: 0.5,
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
          className={modalClassName}
          ref={windowRef as React.RefObject<HTMLDivElement>}
          key={"window-component-modal"}
          initial={{ scale: 0.8, opacity: 0, y: -50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{
            duration: 0.4,
            ease: [0.23, 1, 0.32, 1],
            opacity: { duration: 0.2 },
          }}
          style={Object.keys(modalStyle).length > 0 ? modalStyle : undefined}
        >
          <section className={styles.windowHeader}>
            {isMobileView && sidebar && mobileView === "content" && (
              <div className={styles.windowBackContainer}>
                <button
                  type="button"
                  className={styles.windowBackButton}
                  onClick={goToMenu}
                  aria-label="Volver al menú"
                >
                  <ArrowLeft className={styles.windowBackIcon} />
                </button>
              </div>
            )}
            <div className={styles.windowTitle}>
              <p
                className={`${styles.windowParaph} ${
                  isMobileView && sidebar && mobileView === "content"
                    ? styles.windowParaphActive
                    : ""
                }`}
              >
                {isMobileView && sidebar && mobileView === "content" && activeItemTitle
                  ? activeItemTitle
                  : windowTitle}
              </p>
            </div>
            {closeAction && (
              <div className={styles.windowCrossContainer}>
                <button
                  type="button"
                  className={styles.windowCrossButton}
                  onClick={handleClose}
                  aria-label="Cerrar ventana"
                >
                  <Cross className={styles.windowCrossIcon} />
                </button>
              </div>
            )}
          </section>

          {sidebar ? (
            isMobileView ? (
              <div className={styles.mobileViewWrapper}>
                <AnimatePresence mode="wait" initial={false} custom={direction}>
                  {mobileView === "menu" ? (
                    <motion.div
                      key="mobile-menu"
                      custom={direction}
                      variants={{
                        enter: (d: number) => ({ opacity: 0, x: d > 0 ? 16 : -16 }),
                        center: { opacity: 1, x: 0 },
                        exit: (d: number) => ({ opacity: 0, x: d > 0 ? -16 : 16 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={styles.mobileViewSlide}
                    >
                      <SimpleBar autoHide={true} className={styles.windowContent}>
                        {sidebar}
                      </SimpleBar>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="mobile-content"
                      custom={direction}
                      variants={{
                        enter: (d: number) => ({ opacity: 0, x: d > 0 ? 16 : -16 }),
                        center: { opacity: 1, x: 0 },
                        exit: (d: number) => ({ opacity: 0, x: d > 0 ? -16 : 16 }),
                      }}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                      className={styles.mobileViewSlide}
                    >
                      <SimpleBar autoHide={true} className={styles.windowContent}>
                        {children}
                      </SimpleBar>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className={styles.windowBodyWithSidebar}>
                <aside className={styles.windowSidebarContainer}>{sidebar}</aside>
                <SimpleBar autoHide={true} className={styles.windowMainContent}>
                  {children}
                </SimpleBar>
              </div>
            )
          ) : (
            <SimpleBar autoHide={true} className={styles.windowContent}>
              {children}
            </SimpleBar>
          )}
        </motion.section>
      </motion.div>
    </WindowContext.Provider>,
    container,
  );
}

WindowComponent.Sidebar = WindowSidebar;
WindowComponent.SidebarItem = WindowSidebarItem;
