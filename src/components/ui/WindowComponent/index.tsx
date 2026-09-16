"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { Cross } from "@/components/ui/icons/icons";
import styles from "./WindowComponent.module.css";
import Image from "next/image";

import { Tabs, TabOption } from "@/components/ui/Tabs/Tabs";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";

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
  layoutId = "window-sidebar-tabs",
}: WindowSidebarProps) {
  const platformMobile = usePlatformInfoStore((state) => state.isMobile);
  const [isWindowMobile, setIsWindowMobile] = useState(false);

  useEffect(() => {
    const check = () => {
      setIsWindowMobile(window.innerWidth <= 850);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const isMobileView = platformMobile || isWindowMobile;

  const items = (React.Children.toArray(children).filter(
    React.isValidElement,
  ) as unknown) as React.ReactElement<WindowSidebarItemProps>[];

  const activeIndex = items.findIndex((item) => item.props.active);
  const activeId =
    activeIndex >= 0 ? items[activeIndex].props.id || String(activeIndex) : "0";

  const tabOptions: TabOption[] = items.map((item, idx) => ({
    id: item.props.id || String(idx),
    label: item.props.label,
    icon: item.props.icon,
  }));

  const handleTabChange = (id: string) => {
    const selected = items.find(
      (item, idx) => (item.props.id || String(idx)) === id,
    );
    selected?.props.onClick?.();
  };

  if (isMobileView && tabOptions.length > 0) {
    return (
      <div className={styles.windowSidebarMobileTabsWrapper}>
        <Tabs
          options={tabOptions}
          activeTab={activeId}
          onChange={handleTabChange}
          layoutId={layoutId}
          backgroundColor="var(--background-over-container)"
          indicatorColor="var(--background-over-container)"
          indicatorHoverColor="var(--background-over-container-hover)"
          indicatorShadow="0 1px 3px rgba(0, 0, 0, 0.08)"
          textColor="var(--text-not-available)"
          activeTextColor="var(--text)"
          hoverTextColor="var(--text)"
        />
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
      className={`${styles.sidebarItem} ${active ? styles.sidebarItemActive : ""
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
  const windowRef = useRef<HTMLDivElement | null>(null);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  const createdRef = useRef<HTMLElement | null>(null);

  useOnClickOutside(
    windowRef as any,
    () => {
      crossAction();
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

  const modalClassName = `${styles.windowModal} ${sidebar ? styles.windowModalWithSidebar : ""
    }`;

  return createPortal(
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
        ref={windowRef as any}
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
          <div className={styles.windowTitle}>
            <p className={styles.windowParaph}>{windowTitle}</p>
          </div>
          {closeAction && (
            <div className={styles.windowCrossContainer}>
              <button
                className={styles.windowCrossButton}
                onClick={crossAction}
                aria-label="Cerrar ventana"
              >
                <Cross className={styles.windowCrossIcon} />
              </button>
            </div>
          )}
        </section>

        {sidebar ? (
          <div className={styles.windowBodyWithSidebar}>
            <aside className={styles.windowSidebarContainer}>{sidebar}</aside>
            <SimpleBar autoHide={true} className={styles.windowMainContent}>
              {children}
            </SimpleBar>
          </div>
        ) : (
          <SimpleBar autoHide={true} className={styles.windowContent}>
            {children}
          </SimpleBar>
        )}
      </motion.section>
    </motion.div>,
    container,
  );
}

WindowComponent.Sidebar = WindowSidebar;
WindowComponent.SidebarItem = WindowSidebarItem;
