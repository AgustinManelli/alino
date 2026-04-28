import React, { memo } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import styles from "./BentoGridItem.module.css";
import { BentoItem } from "./DraggableBentoGrid";

interface BentoGridItemProps {
  item: BentoItem;
  isEdit: boolean;
  isDragging: boolean;
}

export const BentoGridItem = memo(
  ({ item, isEdit, isDragging }: BentoGridItemProps) => {
    return (
      <div
        className={`${styles.bentoItem} ${isDragging ? styles.dragging : ""}`}
      >
        <div className={styles.bentoContent}>
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
                    : {}
                }
              >
                {item.icon && (
                  <span className={styles.badgeIcon}>{item.icon}</span>
                )}
                <h3 className={styles.bentoTitle}>{item.title}</h3>
              </div>
            </header>
          )}

          <div
            className={`${styles.dragHandle} dragHandle`}
            style={{
              opacity: isEdit ? 1 : 0,
              pointerEvents: isEdit ? "auto" : "none",
              transform: isEdit ? "scale(1)" : "scale(0.8)",
            }}
            aria-label={`Mover elemento ${item.title}`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="9" cy="12" r="1" />
              <circle cx="9" cy="5" r="1" />
              <circle cx="9" cy="19" r="1" />
              <circle cx="15" cy="12" r="1" />
              <circle cx="15" cy="5" r="1" />
              <circle cx="15" cy="19" r="1" />
            </svg>
          </div>

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
