"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import SimpleBar from "simplebar-react";

import { ResizeIcon } from "./ResizeIcon";

import styles from "./DraggableBentoGrid.module.css";
import "simplebar-react/dist/simplebar.min.css";

export interface BentoItem {
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
  tempLayout: Layouts;
  setTempLayout: (value: Layouts) => void;
}

function DraggableBentoGrid({
  items,
  isEdit,
  setIsEdit,
  tempLayout,
  setTempLayout,
}: Props) {
  const [isMounted, setIsMounted] = useState(false);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    []
  );

  const layoutsWithItemIds = useMemo(() => {
    const newLayouts: Layouts = {};
    for (const breakpoint in tempLayout) {
      newLayouts[breakpoint] = tempLayout[
        breakpoint as keyof typeof tempLayout
      ].map((layoutItem /*, index*/) => ({
        ...layoutItem,
        i: /*items[index]?.id || */ layoutItem.i,
      }));
    }
    return newLayouts;
  }, [items, tempLayout]);

  const handleDragStart = (
    layout: Layout[],
    oldItem: Layout,
    newItem: Layout,
    placeholder: Layout,
    e: MouseEvent,
    element: HTMLElement
  ) => {
    document.body.classList.add("dragging-grid");
    setDraggingItemId(newItem.i);
  };

  const handleDragStop = () => {
    document.body.classList.remove("dragging-grid");
    setDraggingItemId(null);
  };

  return (
    <div style={{ maxWidth: "100%", height: "100%", margin: "auto" }}>
      <ResponsiveReactGridLayout
        className={!isMounted ? styles.gridInitial : ""}
        style={{ width: "100%", height: "auto" }}
        breakpoints={{ lg: 700, md: 600, xs: 200 }}
        cols={{ lg: 3, md: 1, xs: 1 }}
        rowHeight={200}
        layouts={layoutsWithItemIds}
        draggableHandle=".dragHandle"
        compactType="vertical"
        isDraggable={isEdit}
        isResizable={isEdit}
        isDroppable={isEdit}
        resizeHandles={["se"]}
        resizeHandle={<CustomResizeHandle edit={isEdit} />}
        onLayoutChange={(currentLayout: Layout[], allLayouts: Layouts) => {
          setTempLayout(allLayouts);
        }}
        onDragStart={handleDragStart}
        onDragStop={handleDragStop}
        containerPadding={[10, 10]}
      >
        {items.map((item) => (
          <div key={item.id} data-grid-id={item.id}>
            <div
              className={`${styles.bentoItem} ${draggingItemId === item.id ? styles.dragging : ""}`}
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
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default DraggableBentoGrid;

interface CustomResizeHandleProps {
  axis?: string;
  ref?: HTMLElement;
  edit?: boolean;
}

const CustomResizeHandle = React.forwardRef<
  HTMLDivElement,
  CustomResizeHandleProps
>(({ axis = "se", edit, ...props }, ref) => {
  const handleClass = `react-resizable-handle react-resizable-handle-${axis}`;

  return (
    <div
      ref={ref}
      className={handleClass}
      {...props}
      style={{ opacity: edit ? 1 : 0 }}
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
  );
});

CustomResizeHandle.displayName = "CustomResizeHandle";
