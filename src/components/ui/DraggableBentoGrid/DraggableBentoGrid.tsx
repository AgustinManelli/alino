"use client";

import { useEffect, useMemo, useState } from "react";
import { Layout, Layouts, Responsive, WidthProvider } from "react-grid-layout";
import styles from "./DraggableBentoGrid.module.css";
import { HomeLayouts } from "./layout.helper";

export interface BentoItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

function DraggableBentoGrid({ items }: { items: BentoItem[] }) {
  const [currentlayout, setCurrentLayout] = useState(HomeLayouts);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const ResponsiveReactGridLayout = useMemo(
    () => WidthProvider(Responsive),
    []
  );

  const layoutsWithItemIds = useMemo(() => {
    const newLayouts: Layouts = {};
    for (const breakpoint in currentlayout) {
      newLayouts[breakpoint] = currentlayout[
        breakpoint as keyof typeof currentlayout
      ].map((layoutItem, index) => ({
        ...layoutItem,
        i: items[index]?.id || layoutItem.i,
      }));
    }
    return newLayouts;
  }, [items, currentlayout]);

  return (
    <div style={{ maxWidth: "100%", height: "100%", margin: "auto" }}>
      <ResponsiveReactGridLayout
        className={!isMounted ? styles.gridInitial : ""}
        style={{ width: "100%", height: "auto" }}
        breakpoints={{ xl: 1200, lg: 700, md: 600, sm: 480, xs: 200 }}
        cols={{ xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
        rowHeight={200}
        layouts={layoutsWithItemIds}
        draggableHandle=".dragHandle"
        compactType="vertical"
        preventCollision={false}
        isResizable={false}
        onLayoutChange={(currentLayout: Layout[], allLayouts: Layouts) => {
          console.log("Nuevo layout para el breakpoint actual:", currentLayout);
          console.log(
            "Todos los layouts (para todos los breakpoints):",
            allLayouts
          );
          // Logica para el guardado de layouts
        }}
      >
        {items.map((item) => (
          <div key={item.id} className={styles.bentoItem}>
            <div className={styles.bentoContent}>
              <header className={styles.bentoHeader}>
                <h3 className={styles.bentoTitle}>{item.title}</h3>
                <div
                  className={`${styles.dragHandle} dragHandle`}
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
                    <circle cx="9" cy="12" r="1" />{" "}
                    <circle cx="9" cy="5" r="1" />{" "}
                    <circle cx="9" cy="19" r="1" />
                    <circle cx="15" cy="12" r="1" />{" "}
                    <circle cx="15" cy="5" r="1" />{" "}
                    <circle cx="15" cy="19" r="1" />
                  </svg>
                </div>
              </header>
              <main className={styles.bentoBody}>{item.content}</main>
            </div>
          </div>
        ))}
      </ResponsiveReactGridLayout>
    </div>
  );
}

export default DraggableBentoGrid;
