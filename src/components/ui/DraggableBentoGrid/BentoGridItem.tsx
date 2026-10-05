"use client";

import React, { memo, useCallback, useEffect, useRef, useState } from "react";
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
}

const triggerDragStart = (
  targetElement: HTMLElement,
  gridItemElement: HTMLElement,
  clientX: number,
  clientY: number,
  touchId?: number,
) => {
  targetElement.classList.add("alino-drag-handle-active");
  gridItemElement.classList.add("alino-drag-handle-active");

  if (
    typeof touchId === "number" &&
    typeof Touch !== "undefined" &&
    typeof TouchEvent !== "undefined"
  ) {
    try {
      const scrollX = window.scrollX || window.pageXOffset || 0;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const touch = new Touch({
        identifier: touchId,
        target: targetElement,
        clientX,
        clientY,
        pageX: clientX + scrollX,
        pageY: clientY + scrollY,
        screenX: clientX,
        screenY: clientY,
      });

      const touchEvent = new TouchEvent("touchstart", {
        bubbles: true,
        cancelable: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
      });

      targetElement.dispatchEvent(touchEvent);
      return;
    } catch {
      // Fallback to MouseEvent
    }
  }

  const mouseEvent = new MouseEvent("mousedown", {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
    button: 0,
  });
  targetElement.dispatchEvent(mouseEvent);
};

export const BentoGridItem = memo(
  ({ item, isEdit, isDragging, onDelete, onStartEdit }: BentoGridItemProps) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startCoordRef = useRef<{ x: number; y: number } | null>(null);
    const isLongPressTriggeredRef = useRef(false);
    const touchIdRef = useRef<number | undefined>(undefined);
    const [isHolding, setIsHolding] = useState(false);

    const clearTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startCoordRef.current = null;
    }, []);

    useEffect(() => clearTimer, [clearTimer]);

    useEffect(() => {
      if (!isDragging) {
        setIsHolding(false);
      }
    }, [isDragging]);

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

        if (isEdit) {
          if (e.pointerType === "mouse") {
            currentTarget.classList.add("alino-drag-handle-active");
            const gridItemEl = currentTarget.closest(".react-grid-item");
            if (gridItemEl) {
              gridItemEl.classList.add("alino-drag-handle-active");
            }
            return;
          }

          startCoordRef.current = { x: clientX, y: clientY };
          isLongPressTriggeredRef.current = false;

          timerRef.current = setTimeout(() => {
            timerRef.current = null;
            isLongPressTriggeredRef.current = true;
            setIsHolding(true);
            if (typeof navigator !== "undefined" && "vibrate" in navigator) {
              try {
                navigator.vibrate(45);
              } catch {
                return;
              }
            }
            const gridItemEl =
              (currentTarget.closest(".react-grid-item") as HTMLElement | null) ??
              currentTarget;
            triggerDragStart(
              currentTarget,
              gridItemEl,
              clientX,
              clientY,
              touchIdRef.current,
            );
          }, 220);
          return;
        }

        startCoordRef.current = { x: clientX, y: clientY };
        isLongPressTriggeredRef.current = false;

        timerRef.current = setTimeout(() => {
          timerRef.current = null;
          isLongPressTriggeredRef.current = true;
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate(45);
            } catch {
              return;
            }
          }
          onStartEdit?.();
        }, 400);
      },
      [isEdit, onStartEdit],
    );

    const handlePointerMove = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (!startCoordRef.current || !timerRef.current) return;
        const dx = Math.abs(e.clientX - startCoordRef.current.x);
        const dy = Math.abs(e.clientY - startCoordRef.current.y);
        if (dx > 8 || dy > 8) {
          clearTimer();
        }
      },
      [clearTimer],
    );

    const handlePointerUp = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        clearTimer();
        setIsHolding(false);
        if (!isDragging) {
          e.currentTarget.classList.remove("alino-drag-handle-active");
          const gridItemEl = e.currentTarget.closest(".react-grid-item");
          if (gridItemEl) {
            gridItemEl.classList.remove("alino-drag-handle-active");
          }
        }
      },
      [clearTimer, isDragging],
    );

    const handlePointerCancel = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        clearTimer();
        setIsHolding(false);
        e.currentTarget.classList.remove("alino-drag-handle-active");
        const gridItemEl = e.currentTarget.closest(".react-grid-item");
        if (gridItemEl) {
          gridItemEl.classList.remove("alino-drag-handle-active");
        }
      },
      [clearTimer],
    );

    const handleContextMenu = useCallback(
      (e: React.MouseEvent) => {
        if (isEdit || isLongPressTriggeredRef.current) {
          e.preventDefault();
          isLongPressTriggeredRef.current = false;
        }
      },
      [isEdit],
    );

    return (
      <div
        className={`${styles.bentoItem} ${isEdit ? styles.editable : ""} ${isDragging || isHolding ? styles.dragging : ""}`}
        onTouchStart={handleTouchStart}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerCancel}
        onContextMenu={handleContextMenu}
      >
        <div className={styles.bentoContent}>
          {isEdit && onDelete && (
            <button
              type="button"
              className={styles.deleteBadge}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onDelete(item.id);
              }}
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
            </button>
          )}

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
      </div>
    );
  },
);

BentoGridItem.displayName = "BentoGridItem";
