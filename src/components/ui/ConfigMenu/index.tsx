"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";

import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { ConfigCard } from "./ConfigCard";

import { MoreVertical } from "@/components/ui/icons/icons";
import styles from "./ConfigMenu.module.css";

interface ConfigOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
}

interface Props {
  iconWidth: string;
  configOptions: ConfigOption[];
  optionalState?: (value: boolean) => void;
  idScrollArea?: string;
  uniqueId?: string;
  withoutBg?: boolean;
}

export const ConfigMenu = memo(function ConfigMenu({
  iconWidth,
  configOptions,
  optionalState,
  idScrollArea,
  uniqueId = "",
  withoutBg = false,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);

  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    optionalState?.(false);
  }, [optionalState]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const triggerElement = triggerRef.current;
    const menuElement = menuRef.current;
    const scrollContainer = idScrollArea
      ? document.getElementById(idScrollArea)
      : null;

    if (!triggerElement || !menuElement) return;

    const updatePosition = () => {
      const parentRect = triggerElement.getBoundingClientRect();
      const menuRect = menuElement.getBoundingClientRect();

      let top = parentRect.top + parentRect.height + 5;
      const left = parentRect.right - menuRect.width;

      menuElement.style.left = `${left}px`;

      if (parentRect.top > window.innerHeight / 2) {
        top = parentRect.top - menuRect.height - 10;
      }
      menuElement.style.top = `${top}px`;
    };

    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        handleClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("resize", handleClose);
    scrollContainer?.addEventListener("scroll", handleClose);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("resize", handleClose);
      scrollContainer?.removeEventListener("scroll", handleClose);
    };
  }, [open, handleClose, idScrollArea]);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newOpenState = !open;
    setOpen(newOpenState);
    optionalState?.(newOpenState);
  };

  return (
    <>
      <div className={styles.fit} ref={triggerRef}>
        <button
          className={styles.mainButton}
          style={{
            width: iconWidth,
            height: iconWidth,
            backgroundColor: withoutBg
              ? "transparent"
              : open
                ? "var(--background-over-container-hover)"
                : "var(--background-over-container)",
          }}
          onClick={handleTriggerClick}
        >
          <MoreVertical
            style={{
              stroke: "var(--text)",
              width: "20px",
              strokeWidth: "3",
              display: "flex",
            }}
          />
        </button>
      </div>
      <ClientOnlyPortal>
        {open && (
          <section
            ref={menuRef}
            className={`${styles.container} ignore-sidebar-close`}
            id={`config-menu-container-${uniqueId}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <section className={styles.optionsContainer}>
              {configOptions.map((option, index) => (
                <ConfigCard
                  key={`${option.name}-${index}`}
                  name={option.name}
                  icon={option.icon}
                  action={() => {
                    option.action();
                    handleClose();
                  }}
                />
              ))}
            </section>
          </section>
        )}
      </ClientOnlyPortal>
    </>
  );
});
