"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import styles from "./BentoGridItem.module.css";
import { BentoItem } from "./DraggableBentoGrid";

interface BentoGridItemProps {
  item: BentoItem;
  isEdit: boolean;
  isDragging: boolean;
  onDelete?: (id: string) => void;
  onStartEdit?: () => void;
  onHoldChange?: (isHolding: boolean) => void;
}

const triggerDragStart = (
  gridItemElement: HTMLElement,
  clientX: number,
  clientY: number,
) => {
  const mouseEvent = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX,
    clientY,
    button: 0,
    buttons: 1,
  });
  gridItemElement.dispatchEvent(mouseEvent);
};

export const BentoGridItem = memo(
  ({
    item,
    isEdit,
    isDragging,
    onDelete,
    onStartEdit,
    onHoldChange,
  }: BentoGridItemProps) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startCoordRef = useRef<{ x: number; y: number } | null>(null);
    const latestCoordRef = useRef<{ x: number; y: number } | null>(null);
    const isLongPressTriggeredRef = useRef(false);
    const touchIdRef = useRef<number | undefined>(undefined);
    const [isHolding, setIsHolding] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    const handleDelete = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        if (isDeleting) return;
        setIsDeleting(true);
        setTimeout(() => {
          onDelete?.(item.id);
        }, 200);
      },
      [isDeleting, onDelete, item.id],
    );

    const clearTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startCoordRef.current = null;
      latestCoordRef.current = null;
    }, []);

    useEffect(() => clearTimer, [clearTimer]);

    useEffect(() => {
      if (!isHolding) return;
      const handleWindowRelease = () => {
        setIsHolding(false);
        onHoldChange?.(false);
      };
      window.addEventListener("pointerup", handleWindowRelease);
      window.addEventListener("pointercancel", handleWindowRelease);
      return () => {
        window.removeEventListener("pointerup", handleWindowRelease);
        window.removeEventListener("pointercancel", handleWindowRelease);
      };
    }, [isHolding, onHoldChange]);

    const handleTouchStart = useCallback(
      (e: React.TouchEvent<HTMLDivElement>) => {
        touchIdRef.current = e.touches[0]?.identifier;
      },
      [],
    );

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        const target = e.target as HTMLElement | null;
        if (
          target?.closest(
            "button, a, input, textarea, select, [data-no-edit], [data-no-drag], .react-resizable-handle",
          )
        ) {
          return;
        }

        const currentTarget = e.currentTarget;
        const clientX = e.clientX;
        const clientY = e.clientY;

        const holdDuration = isEdit
          ? e.pointerType === "touch"
            ? 200
            : 150
          : 320;

        startCoordRef.current = { x: clientX, y: clientY };
        latestCoordRef.current = { x: clientX, y: clientY };
        isLongPressTriggeredRef.current = false;

        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          isLongPressTriggeredRef.current = true;
          setIsHolding(true);
          onHoldChange?.(true);
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate(45);
            } catch {}
          }
          if (!isEdit) {
            onStartEdit?.();
          }

          const currentX = latestCoordRef.current?.x ?? clientX;
          const currentY = latestCoordRef.current?.y ?? clientY;

          currentTarget.classList.add("alino-drag-ready");

          setTimeout(
            () => {
              triggerDragStart(currentTarget, currentX, currentY);
            },
            isEdit ? 0 : 30,
          );
        }, holdDuration);
      },
      [isEdit, onStartEdit, onHoldChange],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!startCoordRef.current || !timerRef.current) return;
        const dx = Math.abs(e.clientX - startCoordRef.current.x);
        const dy = Math.abs(e.clientY - startCoordRef.current.y);
        if (dx > 8 || dy > 8) {
          clearTimer();
          return;
        }
        latestCoordRef.current = { x: e.clientX, y: e.clientY };
      },
      [clearTimer],
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        clearTimer();
        setIsHolding(false);
        onHoldChange?.(false);
        if (!isDragging) {
          e.currentTarget.classList.remove("alino-drag-handle-active");
          const gridItemEl = e.currentTarget.closest(".react-grid-item");
          if (gridItemEl) {
            gridItemEl.classList.remove("alino-drag-handle-active");
          }
        }
      },
      [clearTimer, isDragging, onHoldChange],
    );

    const handlePointerCancel = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        clearTimer();
        setIsHolding(false);
        onHoldChange?.(false);
        e.currentTarget.classList.remove("alino-drag-handle-active");
        const gridItemEl = e.currentTarget.closest(".react-grid-item");
        if (gridItemEl) {
          gridItemEl.classList.remove("alino-drag-handle-active");
        }
      },
      [clearTimer, onHoldChange],
    );

    const handleClickCapture = useCallback((e: React.MouseEvent) => {
      if (isLongPressTriggeredRef.current) {
        e.stopPropagation();
        e.preventDefault();
        isLongPressTriggeredRef.current = false;
      }
    }, []);

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        if (isEdit || isLongPressTriggeredRef.current) {
          e.preventDefault();
          isLongPressTriggeredRef.current = false;
        }
      },
      [isEdit],
    );

    const isReady = isDragging || isHolding;

    return (
      <motion.div
        className={`${styles.bentoItem} ${isEdit ? styles.editable : ""} ${isReady ? "alino-drag-ready" : ""} ${isReady ? styles.dragging : ""}`}
        initial={
          shouldReduceMotion
            ? { opacity: 0 }
            : { opacity: 0, scale: 0.82, y: 14 }
        }
        animate={
          isDeleting
            ? shouldReduceMotion
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.72, filter: "blur(4px)" }
            : shouldReduceMotion
              ? { opacity: 1 }
              : { opacity: 1, scale: 1, y: 0, filter: "none" }
        }
        transition={
          isDeleting
            ? { duration: 0.2, ease: [0.32, 0, 0.67, 0] }
            : { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
        }
        style={isDeleting ? { pointerEvents: "none" } : undefined}
        onTouchStart={handleTouchStart}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onClickCapture={handleClickCapture}
        onContextMenu={handleContextMenu}
      >
        <div className={styles.bentoContent}>
          <AnimatePresence>
            {isEdit && onDelete && (
              <motion.button
                key="delete-badge"
                type="button"
                className={styles.deleteBadge}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.4 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                onClick={handleDelete}
                disabled={isDeleting}
                aria-label={`Desinstalar ${item.title}`}
                title="Desinstalar widget"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </motion.button>
            )}
          </AnimatePresence>

          {!(item.withoutHeader ?? false) && (
            <header className={styles.bentoHeader}>
              <div
                className={styles.bentoBadge}
                style={
                  item.color
                    ? {
                        backgroundColor: `color-mix(in srgb, ${item.color} 8%, transparent)`,
                        color: item.color,
                      }
                    : undefined
                }
              >
                {item.icon && (
                  <span className={styles.badgeIcon}>{item.icon}</span>
                )}
                <h3 className={styles.bentoTitle}>{item.title}</h3>
              </div>
            </header>
          )}

          {(item.scrollable ?? false) ? (
            <SimpleBar autoHide={false} className={styles.bentoBody}>
              {item.content}
            </SimpleBar>
          ) : (
            <div className={styles.bentoBody}>{item.content}</div>
          )}
        </div>
      </motion.div>
    );
  },
);

BentoGridItem.displayName = "BentoGridItem";
