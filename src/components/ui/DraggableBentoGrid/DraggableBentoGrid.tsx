"use client";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Responsive,
  useContainerWidth,
  verticalCompactor,
} from "react-grid-layout";
import type {
  EventCallback,
  Layout,
  LayoutItem,
  ResizeHandleAxis,
  ResponsiveLayouts,
} from "react-grid-layout";
import { ResizeHandle } from "./ResizeHandle";
import styles from "./DraggableBentoGrid.module.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

import { BentoGridItem } from "./BentoGridItem";

export interface BentoItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  color?: string;
  content: React.ReactNode;
  withoutTopPadding?: boolean;
  withoutHeader?: boolean;
  scrollable?: boolean;
  isResizable?: boolean;
}

interface Props {
  items: BentoItem[];
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  tempLayout: ResponsiveLayouts;
  setTempLayout: (value: ResponsiveLayouts) => void;
  onDelete?: (id: string) => void;
  onFinishEdit?: () => void;
}

const BREAKPOINTS = { lg: 700, md: 600, xs: 200 };

const WIGGLE_DURATIONS = [0.12, 0.14, 0.16, 0.18];
const WIGGLE_DELAYS = [0, -0.03, -0.06, -0.09];

const KEEP_EDIT_SELECTOR =
  "[data-grid-id], [data-no-exit-edit], [role='dialog'], [role='alertdialog'], button, a, input, textarea, select";

const getBreakpoint = (width: number): keyof typeof BREAKPOINTS => {
  if (width >= BREAKPOINTS.lg) return "lg";
  if (width >= BREAKPOINTS.md) return "md";
  return "xs";
};

const isLayoutItemResizable = (layoutItem: LayoutItem | undefined) => {
  if (!layoutItem) return true;
  if (layoutItem.isResizable === false) return false;
  const { minW, maxW, minH, maxH } = layoutItem;
  if (
    minW !== undefined &&
    maxW !== undefined &&
    minH !== undefined &&
    maxH !== undefined &&
    minW === maxW &&
    minH === maxH
  ) {
    return false;
  }
  return true;
};

interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  isEdit: boolean;
  isDragging: boolean;
  isResizable: boolean;
  wiggleIndex: number;
  "data-grid"?: unknown;
}

const GridCell = forwardRef<HTMLDivElement, GridCellProps>(
  (
    {
      isEdit,
      isDragging,
      isResizable,
      wiggleIndex,
      className,
      style,
      children,
      "data-grid": dataGrid,
      ...rest
    },
    ref,
  ) => {
    void dataGrid;

    const variant = Math.abs(wiggleIndex) % WIGGLE_DURATIONS.length;
    const wiggleStyle = {
      "--wiggle-duration": `${WIGGLE_DURATIONS[variant]}s`,
      "--wiggle-delay": `${WIGGLE_DELAYS[variant]}s`,
      "--wiggle-direction":
        wiggleIndex % 2 === 0 ? "alternate" : "alternate-reverse",
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        {...rest}
        className={`${className ?? ""} ${isEdit ? styles.cellEditing : ""}`.trim()}
        style={style}
      >
        <div
          className={`${styles.wiggle} ${isEdit ? styles.wiggleActive : ""} ${isDragging ? styles.wiggleDragging : ""}`.trim()}
          style={wiggleStyle}
          data-dragging={isDragging ? "true" : "false"}
          data-resizable={isResizable ? "true" : "false"}
        >
          {children}
        </div>
      </div>
    );
  },
);

GridCell.displayName = "GridCell";

export const DraggableBentoGrid = memo(
  ({
    items,
    isEdit,
    setIsEdit,
    tempLayout,
    setTempLayout,
    onDelete,
    onFinishEdit,
  }: Props) => {
    const { width, containerRef, mounted } = useContainerWidth();
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    const breakpoint = getBreakpoint(width);

    const resizableMap = useMemo(() => {
      const currentLayout: readonly LayoutItem[] =
        (tempLayout as Record<string, readonly LayoutItem[] | undefined>)[
          breakpoint
        ] ?? [];
      const map: Record<string, boolean> = {};
      for (const item of items) {
        const layoutItem = currentLayout.find((l) => l.i === item.id);
        map[item.id] =
          item.isResizable !== false && isLayoutItemResizable(layoutItem);
      }
      return map;
    }, [items, tempLayout, breakpoint]);

    useEffect(() => {
      if (!mounted || width <= 0) return;
      const timer = setTimeout(() => setIsInitializing(false), 200);
      return () => clearTimeout(timer);
    }, [mounted, width]);

    useEffect(() => {
      return () => {
        document.body.classList.remove("dragging-grid");
      };
    }, []);

    useEffect(() => {
      if (!isEdit) return;

      const handlePointerDown = (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (target?.closest(KEEP_EDIT_SELECTOR)) return;
        if (onFinishEdit) {
          onFinishEdit();
        } else {
          setIsEdit(false);
        }
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") setIsEdit(false);
      };

      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isEdit, setIsEdit]);

    const handleDragStart: EventCallback = useCallback(
      (_layout: Layout, _oldItem, newItem: LayoutItem | null) => {
        document.body.classList.add("dragging-grid");
        if (newItem) setDraggingItemId(newItem.i);
      },
      [],
    );

    const handleDragStop: EventCallback = useCallback(() => {
      document.body.classList.remove("dragging-grid");
      setDraggingItemId(null);
    }, []);

    const resizeHandleComponent = useCallback(
      (
        axis: ResizeHandleAxis,
        ref: React.Ref<HTMLElement>,
      ): React.ReactElement => (
        <ResizeHandle
          ref={ref as React.Ref<HTMLDivElement>}
          axis={axis}
          isEdit={isEdit}
        />
      ),
      [isEdit],
    );

    const handleStartEdit = useCallback(() => {
      setIsEdit(true);
    }, [setIsEdit]);

    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={isInitializing ? styles.noTransitions : ""}
        style={{ maxWidth: "800px", height: "100%", margin: "auto" }}
      >
        {mounted && width > 0 && (
          <Responsive
            width={width}
            style={{ width: "100%", height: "auto" }}
            breakpoints={BREAKPOINTS}
            cols={{ lg: 3, md: 1, xs: 1 }}
            rowHeight={200}
            layouts={tempLayout}
            compactor={verticalCompactor}
            dragConfig={{
              enabled: isEdit,
              cancel:
                ".react-resizable-handle, button, a, input, textarea, select, [data-no-drag]",
            }}
            resizeConfig={{
              enabled: true,
              handles: ["se"],
              handleComponent: resizeHandleComponent,
            }}
            dropConfig={{ enabled: isEdit }}
            onLayoutChange={(
              _currentLayout: Layout,
              allLayouts: ResponsiveLayouts,
            ) => {
              setTempLayout(allLayouts);
            }}
            onDragStart={handleDragStart}
            onDragStop={handleDragStop}
          >
            {items.map((item, index) => (
              <GridCell
                key={item.id}
                data-grid-id={item.id}
                data-grid={
                  item.isResizable !== undefined
                    ? { isResizable: item.isResizable }
                    : undefined
                }
                isEdit={isEdit}
                isDragging={draggingItemId === item.id}
                isResizable={resizableMap[item.id] ?? true}
                wiggleIndex={index}
              >
                <BentoGridItem
                  item={item}
                  isEdit={isEdit}
                  isDragging={draggingItemId === item.id}
                  onDelete={onDelete}
                  onStartEdit={handleStartEdit}
                />
              </GridCell>
            ))}
          </Responsive>
        )}
      </div>
    );
  },
);

DraggableBentoGrid.displayName = "DraggableBentoGrid";
