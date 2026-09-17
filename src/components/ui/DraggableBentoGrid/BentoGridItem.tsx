import React, { memo } from "react";
import SimpleBar from "simplebar-react";
import "simplebar-react/dist/simplebar.min.css";
import styles from "./BentoGridItem.module.css";
import { BentoItem } from "./DraggableBentoGrid";

interface BentoGridItemProps {
  item: BentoItem;
  isEdit: boolean;
  isDragging: boolean;
  onDelete?: (id: string) => void;
}

export const BentoGridItem = memo(
  ({ item, isEdit, isDragging, onDelete }: BentoGridItemProps) => {
    return (
      <div
        className={`${styles.bentoItem} ${isDragging ? styles.dragging : ""}`}
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
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
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
                        marginLeft: isEdit ? "26px" : "0px",
                        transition: "margin-left 0.2s ease",
                      }
                    : {
                        marginLeft: isEdit ? "26px" : "0px",
                        transition: "margin-left 0.2s ease",
                      }
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
