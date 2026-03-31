"use client";
import React, { memo, useCallback, useEffect, useState } from "react";
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
import SimpleBar from "simplebar-react";
import { ResizeIcon } from "./ResizeIcon";
import styles from "./DraggableBentoGrid.module.css";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import "simplebar-react/dist/simplebar.min.css";

interface BentoItem {
  id: string;
  title: string;
  content: React.ReactNode;
  withoutTopPadding?: boolean;
  withoutHeader?: boolean;
  scrollable?: boolean;
}

interface Props {
  items: BentoItem[];
  isEdit: boolean;
  setIsEdit: (value: boolean) => void;
  tempLayout: ResponsiveLayouts;
  setTempLayout: (value: ResponsiveLayouts) => void;
}

export const DraggableBentoGrid = memo(
  ({ items, isEdit, setIsEdit, tempLayout, setTempLayout }: Props) => {
    const { width, containerRef, mounted } = useContainerWidth();
    const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
    const [isInitializing, setIsInitializing] = useState(true);

    useEffect(() => {
      if (mounted && width > 0) {
        const timer = setTimeout(() => setIsInitializing(false), 200);
        return () => clearTimeout(timer);
      }
    }, [mounted, width]);

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
        <div
          ref={ref as React.Ref<HTMLDivElement>}
          className={`react-resizable-handle react-resizable-handle-${axis}`}
          style={{
            opacity: isEdit ? 1 : 0,
            pointerEvents: isEdit ? "auto" : "none",
            display: isEdit ? "block" : "none",
          }}
        >
          <ResizeIcon
            style={{
              width: "40px",
              height: "40px",
              stroke: "rgba(255,255,255,0.5)",
              strokeWidth: 1,
              fill: "rgba(255,255,255,0.3)",
              pointerEvents: "none",
            }}
          />
        </div>
      ),
      [isEdit],
    );

    return (
      <div
        ref={containerRef as React.RefObject<HTMLDivElement>}
        className={isInitializing ? styles.noTransitions : ""}
        style={{ maxWidth: "1024px", height: "100%", margin: "auto" }}
      >
        {mounted && width > 0 && (
          <Responsive
            width={width}
            style={{ width: "100%", height: "auto" }}
            breakpoints={{ lg: 700, md: 600, xs: 200 }}
            cols={{ lg: 3, md: 1, xs: 1 }}
            rowHeight={200}
            // containerPadding={[10, 10]}
            layouts={tempLayout}
            compactor={verticalCompactor}
            dragConfig={{
              enabled: isEdit,
              handle: ".dragHandle",
            }}
            resizeConfig={{
              enabled: isEdit,
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
            {items.map((item) => (
              <div key={item.id} data-grid-id={item.id}>
                <div
                  className={`${styles.bentoItem} ${
                    draggingItemId === item.id ? styles.dragging : ""
                  }`}
                >
                  <div className={styles.bentoContent}>
                    {!(item.withoutHeader ?? false) && (
                      <header className={styles.bentoHeader}>
                        <h3 className={styles.bentoTitle}>{item.title}</h3>
                      </header>
                    )}

                    <div
                      className={`${styles.dragHandle} dragHandle`}
                      style={{ visibility: isEdit ? "visible" : "hidden" }}
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
                      <SimpleBar
                        className={styles.bentoBody}
                        style={{
                          paddingTop:
                            (item.withoutTopPadding ?? false) ? 0 : "40px",
                        }}
                      >
                        {item.content}
                      </SimpleBar>
                    ) : (
                      <div
                        className={styles.bentoBody}
                        style={{
                          paddingTop:
                            (item.withoutTopPadding ?? false) ? 0 : "40px",
                        }}
                      >
                        {item.content}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </Responsive>
        )}
      </div>
    );
  },
);

DraggableBentoGrid.displayName = "DraggableBentoGrid";
