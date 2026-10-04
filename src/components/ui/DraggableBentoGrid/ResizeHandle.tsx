"use client";
import React, { forwardRef, useId } from "react";
import type { ResizeHandleAxis } from "react-grid-layout";
import styles from "./ResizeHandle.module.css";

interface ResizeHandleProps extends React.HTMLAttributes<HTMLDivElement> {
  isEdit: boolean;
  axis?: ResizeHandleAxis;
}

const SHAPE_PATH =
  "m4,18.52c-2.21,0-4-1.79-4-4s1.79-4,4-4c3.6,0,6.52-2.93,6.52-6.52,0-2.21,1.79-4,4-4s4,1.79,4,4c0,8.01-6.51,14.52-14.52,14.52Z";

export const ResizeHandle = forwardRef<HTMLDivElement, ResizeHandleProps>(
  ({ isEdit, axis, className, ...rest }, ref) => {
    const gradientId = `resize-stroke-${useId().replace(/:/g, "")}`;
    const axisClass = axis
      ? `react-resizable-handle-${axis}`
      : "react-resizable-handle-se";

    return (
      <div
        ref={ref}
        {...rest}
        aria-hidden="true"
        className={`${styles.handle} react-resizable-handle ${axisClass} ${isEdit ? styles.visible : ""} ${className ?? ""}`.trim()}
      >
        <div className={styles.glass} />
        <svg
          className={styles.outline}
          viewBox="0 0 18.52 18.52"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop
                offset="0"
                stopColor="var(--resize-handle-stroke, #000)"
                stopOpacity="var(--resize-handle-op-1, 0.45)"
              />
              <stop
                offset="0.5"
                stopColor="var(--resize-handle-stroke, #000)"
                stopOpacity="var(--resize-handle-op-2, 0.1)"
              />
              <stop
                offset="1"
                stopColor="var(--resize-handle-stroke, #000)"
                stopOpacity="var(--resize-handle-op-3, 0.28)"
              />
            </linearGradient>
          </defs>
          <path className={styles.hit} d={SHAPE_PATH} />
          <path
            d={SHAPE_PATH}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="0.5"
          />
        </svg>
      </div>
    );
  },
);

ResizeHandle.displayName = "ResizeHandle";
