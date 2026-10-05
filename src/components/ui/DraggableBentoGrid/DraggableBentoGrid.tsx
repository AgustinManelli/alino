"use client";
import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
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

const findScrollContainer = (el: HTMLElement | null): HTMLElement | null => {
  let parent = el?.parentElement;
  while (parent) {
    const style = window.getComputedStyle(parent);
    const overflowY = style.overflowY;
    if (
      (overflowY === "auto" || overflowY === "scroll") &&
      parent.scrollHeight > parent.clientHeight
    ) {
      return parent;
    }
    parent = parent.parentElement;
  }
  return (
    (document.scrollingElement as HTMLElement | null) ??
    document.documentElement
  );
};

const dispatchSyntheticMove = (
  clientX: number,
  clientY: number,
  touchId?: number,
) => {
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
        target: document.body,
        clientX,
        clientY,
        pageX: clientX + scrollX,
        pageY: clientY + scrollY,
        screenX: clientX,
        screenY: clientY,
      });

      const touchEvent = new TouchEvent("touchmove", {
        bubbles: true,
        cancelable: true,
        touches: [touch],
        targetTouches: [touch],
        changedTouches: [touch],
      });

      document.dispatchEvent(touchEvent);
      return;
    } catch {}
  }

  const mouseEvent = new MouseEvent("mousemove", {
    bubbles: true,
    cancelable: true,
    clientX,
    clientY,
  });
  document.dispatchEvent(mouseEvent);
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
        className={`${className ?? ""} ${isEdit ? styles.cellEditing : ""} ${isDragging ? styles.cellDragging : ""}`.trim()}
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

    const isDraggingRef = useRef(false);
    const pointerYRef = useRef<number | null>(null);
    const pointerXRef = useRef<number | null>(null);
    const activeTouchIdRef = useRef<number | undefined>(undefined);
    const animFrameIdRef = useRef<number | null>(null);
    const scrollContainerRef = useRef<HTMLElement | null>(null);

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
      const handleTouchStart = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          activeTouchIdRef.current = e.touches[0].identifier;
          pointerYRef.current = e.touches[0].clientY;
          pointerXRef.current = e.touches[0].clientX;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (isDraggingRef.current) {
          if (e.cancelable) {
            e.preventDefault();
          }
          if (e.touches.length > 0) {
            pointerYRef.current = e.touches[0].clientY;
            pointerXRef.current = e.touches[0].clientX;
            activeTouchIdRef.current = e.touches[0].identifier;
          }
        }
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (isDraggingRef.current) {
          pointerYRef.current = e.clientY;
          pointerXRef.current = e.clientX;
        }
      };

      window.addEventListener("touchstart", handleTouchStart, {
        passive: true,
      });
      window.addEventListener("touchmove", handleTouchMove, { passive: false });
      window.addEventListener("mousemove", handleMouseMove);

      return () => {
        window.removeEventListener("touchstart", handleTouchStart);
        window.removeEventListener("touchmove", handleTouchMove);
        window.removeEventListener("mousemove", handleMouseMove);
      };
    }, []);

    const stopAutoScroll = useCallback(() => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
        animFrameIdRef.current = null;
      }
      scrollContainerRef.current = null;
      pointerYRef.current = null;
      pointerXRef.current = null;
    }, []);

    const startAutoScroll = useCallback(() => {
      const container = findScrollContainer(
        (containerRef as React.RefObject<HTMLDivElement>).current,
      );
      scrollContainerRef.current = container;
      if (!container) return;

      const step = () => {
        if (!isDraggingRef.current) return;

        const currentY = pointerYRef.current;
        const currentX = pointerXRef.current;
        const targetContainer = scrollContainerRef.current;

        if (currentY !== null && targetContainer) {
          const rect = targetContainer.getBoundingClientRect();
          const topThreshold = Math.max(rect.top + 70, 160);
          const bottomThreshold = Math.min(
            rect.bottom - 70,
            window.innerHeight - 80,
          );

          let scrollDelta = 0;
          if (currentY < topThreshold) {
            const distance = topThreshold - currentY;
            const factor = Math.min(Math.max(distance / 70, 0.2), 1);
            scrollDelta = -Math.round(factor * 14);
          } else if (currentY > bottomThreshold) {
            const distance = currentY - bottomThreshold;
            const factor = Math.min(Math.max(distance / 70, 0.2), 1);
            scrollDelta = Math.round(factor * 14);
          }

          if (scrollDelta !== 0) {
            targetContainer.scrollTop += scrollDelta;
            if (currentX !== null) {
              dispatchSyntheticMove(
                currentX,
                currentY,
                activeTouchIdRef.current,
              );
            }
          }
        }

        animFrameIdRef.current = requestAnimationFrame(step);
      };

      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
      animFrameIdRef.current = requestAnimationFrame(step);
    }, [containerRef]);

    useEffect(() => {
      return () => {
        stopAutoScroll();
      };
    }, [stopAutoScroll]);

    useEffect(() => {
      if (!isEdit) return;

      let startPos: { x: number; y: number; time: number } | null = null;
      let hasMoved = false;

      const handlePointerDown = (event: PointerEvent) => {
        if (event.button !== 0) return;
        const target = event.target as HTMLElement | null;
        if (target?.closest(KEEP_EDIT_SELECTOR)) {
          startPos = null;
          return;
        }
        startPos = { x: event.clientX, y: event.clientY, time: Date.now() };
        hasMoved = false;
      };

      const handlePointerMove = (event: PointerEvent) => {
        if (!startPos) return;
        const dist = Math.hypot(
          event.clientX - startPos.x,
          event.clientY - startPos.y,
        );
        if (dist > 8) {
          hasMoved = true;
        }
      };

      const handlePointerUp = () => {
        if (!startPos) return;
        const elapsed = Date.now() - startPos.time;
        if (!hasMoved && elapsed < 350) {
          if (onFinishEdit) {
            onFinishEdit();
          } else {
            setIsEdit(false);
          }
        }
        startPos = null;
        hasMoved = false;
      };

      const handlePointerCancel = () => {
        startPos = null;
        hasMoved = false;
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === "Escape") {
          if (onFinishEdit) {
            onFinishEdit();
          } else {
            setIsEdit(false);
          }
        }
      };

      document.addEventListener("pointerdown", handlePointerDown, true);
      document.addEventListener("pointermove", handlePointerMove, true);
      document.addEventListener("pointerup", handlePointerUp, true);
      document.addEventListener("pointercancel", handlePointerCancel, true);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("pointerdown", handlePointerDown, true);
        document.removeEventListener("pointermove", handlePointerMove, true);
        document.removeEventListener("pointerup", handlePointerUp, true);
        document.removeEventListener(
          "pointercancel",
          handlePointerCancel,
          true,
        );
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isEdit, setIsEdit, onFinishEdit]);

    const handleDragStart: EventCallback = useCallback(
      (_layout: Layout, _oldItem, newItem: LayoutItem | null) => {
        document.body.classList.add("dragging-grid");
        isDraggingRef.current = true;
        if (newItem) setDraggingItemId(newItem.i);
        startAutoScroll();
      },
      [startAutoScroll],
    );

    const handleDragStop: EventCallback = useCallback(() => {
      document.body.classList.remove("dragging-grid");
      isDraggingRef.current = false;
      stopAutoScroll();
      setDraggingItemId(null);
      document.querySelectorAll(".alino-drag-handle-active").forEach((el) => {
        el.classList.remove("alino-drag-handle-active");
      });
    }, [stopAutoScroll]);

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
              handle: ".alino-drag-handle-active",
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
