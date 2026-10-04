"use client";

import React, { memo, useCallback, useEffect, useRef } from "react";
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

export const BentoGridItem = memo(
  ({ item, isEdit, isDragging, onDelete, onStartEdit }: BentoGridItemProps) => {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startCoordRef = useRef<{ x: number; y: number } | null>(null);
    const isLongPressTriggeredRef = useRef(false);

    const clearTimer = useCallback(() => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      startCoordRef.current = null;
    }, []);

    useEffect(() => clearTimer, [clearTimer]);

    const handlePointerDown = useCallback(
      (e: React.PointerEvent<HTMLDivElement>) => {
        if (isEdit || e.button !== 0) return;
        const target = e.target as HTMLElement | null;
        if (
          target?.closest(
            "button, a, input, textarea, select, [data-no-edit], .react-resizable-handle",
          )
        ) {
          return;
        }

        startCoordRef.current = { x: e.clientX, y: e.clientY };
        isLongPressTriggeredRef.current = false;

        const currentTarget = e.currentTarget;
        const clientX = e.clientX;
        const clientY = e.clientY;

        timerRef.current = setTimeout(() => {
          isLongPressTriggeredRef.current = true;
          if (typeof navigator !== "undefined" && "vibrate" in navigator) {
            try {
              navigator.vibrate(45);
            } catch {
              return;
            }
          }
          onStartEdit?.();

          const gridItemEl = currentTarget.closest(".react-grid-item");
          if (gridItemEl) {
            setTimeout(() => {
              const syntheticDown = new MouseEvent("mousedown", {
                bubbles: true,
                cancelable: true,
                clientX,
                clientY,
                button: 0,
              });
              gridItemEl.dispatchEvent(syntheticDown);
            }, 30);
          }
        }, 450);
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

    const handlePointerUp = useCallback(() => {
      clearTimer();
    }, [clearTimer]);

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
        className={`${styles.bentoItem} ${isEdit ? styles.editable : ""} ${isDragging ? styles.dragging : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
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
