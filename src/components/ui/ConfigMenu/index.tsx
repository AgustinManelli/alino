"use client";

import { useEffect, useRef, useState, useCallback, memo } from "react";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { SubMenuPanel } from "./SubMenuOptionPanel";
import { MoreVertical } from "@/components/ui/icons/icons";
import { ConfigOption } from "./types";
import styles from "./ConfigMenu.module.css";

export type {
  ConfigOption,
  ConfigActionOption,
  ConfigSubmenuOption,
} from "./types";

interface Props {
  iconWidth: string;
  configOptions: ConfigOption[];
  optionalState?: (value: boolean) => void;
  idScrollArea?: string;
  uniqueId?: string;
  withoutBg?: boolean;
  debugTriangle?: boolean;
}

export const ConfigMenu = memo(function ConfigMenu({
  iconWidth,
  configOptions,
  optionalState,
  idScrollArea,
  uniqueId = "",
  withoutBg = false,
  debugTriangle = false,
}: Props) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleClose = useCallback(() => {
    setOpen(false);
    optionalState?.(false);
  }, [optionalState]);

  useEffect(() => {
    if (!open) return;
    const triggerEl = triggerRef.current;
    const menuEl = menuRef.current;
    const scrollContainer = idScrollArea
      ? document.getElementById(idScrollArea)
      : null;
    if (!triggerEl || !menuEl) return;

    const updatePosition = () => {
      const parentRect = triggerEl.getBoundingClientRect();
      const menuRect = menuEl.getBoundingClientRect();
      const left = parentRect.right - menuRect.width;
      const top =
        parentRect.top > window.innerHeight / 2
          ? parentRect.top - menuRect.height - 10
          : parentRect.top + parentRect.height + 5;
      menuEl.style.right = "auto";
      menuEl.style.left = `${left}px`;
      menuEl.style.top = `${top}px`;
    };

    updatePosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target) &&
        !target?.closest?.(".config-menu-portal")
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

  const handleTriggerClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setOpen((prev) => {
        const next = !prev;
        optionalState?.(next);
        return next;
      });
    },
    [optionalState],
  );

  return (
    <>
      <div className={styles.fit} ref={triggerRef}>
        <button
          className={styles.mainButton}
          style={
            {
              "--icon-width": iconWidth,
              "--bg-color": withoutBg
                ? "transparent"
                : open
                  ? "var(--background-over-container-hover)"
                  : "var(--background-over-container)",
            } as React.CSSProperties
          }
          onClick={handleTriggerClick}
        >
          <MoreVertical className={styles.moreVerticalIcon} />
        </button>
      </div>

      <ClientOnlyPortal>
        {open && (
          <section
            ref={menuRef}
            className={`${styles.container} ignore-sidebar-close config-menu-portal`}
            id={`config-menu-container-${uniqueId}`}
            onClick={(e) => e.stopPropagation()}
          >
            <SubMenuPanel
              options={configOptions}
              depth={0}
              onRootClose={handleClose}
              debugTriangle={debugTriangle}
            />
          </section>
        )}
      </ClientOnlyPortal>
    </>
  );
});
