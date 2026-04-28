"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveLayouts } from "react-grid-layout";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useUIStore } from "@/store/useUIStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useLoadDashboard } from "@/hooks/dashboard/useLoadDashboard";
import { useFetchDashboardData } from "@/hooks/dashboard/useFetchDashboardData";
import { useFetchAppUpdates } from "@/hooks/dashboard/useFetchAppUpdates";
import { useDashboardLayoutActions } from "@/hooks/dashboard/useDashboardLayoutActions";
import { useSaveWidgetLayouts } from "@/hooks/dashboard/useSaveWidgetLayouts";

import { tierSatisfies } from "@/config/widgets.registry";
import WIDGET_COMPONENTS from "@/config/widgetComponents";
import WIDGET_UI_META from "@/config/widgetUiMeta";

import { UpgradePlaceholder } from "./parts/UpgradePlaceholder";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import {
  DraggableBentoGrid,
  type BentoItem,
} from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";
import { AnimatePresence, motion } from "motion/react";

import dynamic from "next/dynamic";

import {
  Check,
  EditGrid,
  ReloadIcon,
  GridPlusIcon,
  Link,
} from "@/components/ui/icons/icons";
import styles from "./HomeDashboard.module.css";

const BLUR_COLOR = "rgb(106, 195, 255)";

const EmbeddedWidget = dynamic(
  () => import("./parts/EmbeddedWidget").then((mod) => mod.EmbeddedWidget),
  { ssr: false },
);
const WidgetGallery = dynamic(
  () => import("./WidgetGallery/index").then((mod) => mod.WidgetGallery),
  { ssr: false },
);

interface ConfigOption {
  name: string;
  icon: React.ReactNode;
  action: () => void;
  enabled: boolean;
}

const useDateAndGreeting = () => {
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const formattedDate = now.toLocaleDateString("es-ES", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const greeting =
      hour < 12 ? "Buen día" : hour < 19 ? "Buenas tardes" : "Buenas noches";
    return { formattedDate, greeting };
  }, []);
};

export const HomeDashboard = () => {
  const setBlurredFx = useUIStore((state) => state.setColor);
  const user = useUserDataStore((state) => state.user);

  const { layout, isConfigLoaded, setLayout, widgetInstances } =
    useDashboardStore();

  const { autoSortLayout } = useDashboardLayoutActions();

  const { loadDashboard } = useLoadDashboard();
  const { fetchDashboardData } = useFetchDashboardData();
  const { fetchAppUpdates } = useFetchAppUpdates();

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [tempLayout, setTempLayout] = useState<ResponsiveLayouts>({});
  const [showGallery, setShowGallery] = useState(false);

  const initRef = useRef(false);
  const { formattedDate, greeting } = useDateAndGreeting();
  const userTier = user?.tier ?? "free";

  useEffect(() => {
    setBlurredFx(BLUR_COLOR);
  }, [setBlurredFx]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    const init = async () => {
      await loadDashboard();
      const currentActive = useDashboardStore.getState().activeWidgets;
      const needsData =
        currentActive.includes("summary") ||
        currentActive.includes("upcoming-tasks");
      const needsUpdates = currentActive.includes("new-features");
      await Promise.all([
        needsData ? fetchDashboardData() : Promise.resolve(),
        needsUpdates ? fetchAppUpdates() : Promise.resolve(),
      ]);
    };
    init();
  }, [loadDashboard, fetchDashboardData, fetchAppUpdates]);

  useEffect(() => {
    if (isConfigLoaded) {
      setTempLayout(layout);
    }
  }, [isConfigLoaded, layout]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEdit(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isBentoItem = (item: any): item is BentoItem => item !== null;

  const bentoItems: BentoItem[] = useMemo(() => {
    return widgetInstances
      .filter((inst) => inst.isInstalled && inst.pwIsActive !== false)
      .map((inst): BentoItem | null => {
        if (inst.widgetSource === "predefined") {
          const key = inst.componentKey ?? inst.widgetKey;
          const WidgetComponent = WIDGET_COMPONENTS[key];

          if (!WidgetComponent) return null;

          const isAllowed = tierSatisfies(
            userTier,
            inst.pwTierRequired ?? "free",
          );

          const meta = WIDGET_UI_META[key] ?? {
            icon: null,
            color: "#6366f1",
          };

          return {
            id: inst.widgetKey,
            title: inst.pwName ?? inst.widgetKey,
            icon: meta.icon,
            color: meta.color,
            content: isAllowed ? (
              <WidgetComponent />
            ) : (
              <UpgradePlaceholder widgetName={inst.pwName ?? ""} />
            ),
            withoutTopPadding: meta.withoutTopPadding ?? false,
            withoutHeader: meta.withoutHeader ?? false,
            scrollable: meta.scrollable ?? false,
          };
        }

        if (inst.widgetSource === "embedded" && inst.uwUrl) {
          return {
            id: inst.widgetKey,
            title: inst.uwTitle ?? "Widget",
            icon: <Link style={{ width: "16px" }} />,
            color: "#6366f1",
            content: (
              <EmbeddedWidget
                widget={{
                  title: inst.uwTitle ?? "Widget",
                  url: inst.uwUrl,
                }}
              />
            ),
            withoutTopPadding: true,
            withoutHeader: false,
            scrollable: false,
          };
        }

        return null;
      })
      .filter(isBentoItem);
  }, [widgetInstances, userTier]);

  const displayName = useMemo(
    () => user?.display_name?.split(" ")[0] ?? "Bienvenido",
    [user?.display_name],
  );

  const handleEditDashboard = useCallback(() => {
    setTempLayout(layout);
    setIsEdit(true);
  }, [layout]);

  const handleAutoSortDashboard = useCallback(() => {
    autoSortLayout();
    if (isEdit) {
      setTempLayout(useDashboardStore.getState().layout);
    }
  }, [autoSortLayout, isEdit]);

  const { scheduleSave } = useSaveWidgetLayouts();

  const handleFinishEdit = useCallback(() => {
    if (JSON.stringify(layout) !== JSON.stringify(tempLayout)) {
      setLayout(tempLayout);
      const { widgetInstances, setWidgetInstances } =
        useDashboardStore.getState();

      const newInstances = widgetInstances.map((instance) => {
        const id = instance.widgetKey;
        const lg = tempLayout.lg?.find((l) => l.i === id);
        const md = tempLayout.md?.find((l) => l.i === id);
        const xs = tempLayout.xs?.find((l) => l.i === id);
        return {
          ...instance,
          layoutLg: lg
            ? { i: id, x: lg.x, y: lg.y, w: lg.w, h: lg.h }
            : instance.layoutLg,
          layoutMd: md
            ? { i: id, x: md.x, y: md.y, w: md.w, h: md.h }
            : instance.layoutMd,
          layoutXs: xs
            ? { i: id, x: xs.x, y: xs.y, w: xs.w, h: xs.h }
            : instance.layoutXs,
        };
      });

      setWidgetInstances(newInstances);
      scheduleSave();
    }
    setIsEdit(false);
  }, [layout, tempLayout, setLayout, scheduleSave]);

  const effectiveLayout = isEdit ? tempLayout : layout;

  const handleSetTempLayout = useCallback(
    (newLayouts: ResponsiveLayouts) => {
      if (isEdit) {
        setTempLayout(newLayouts);
      }
    },
    [isEdit],
  );

  const configOptions: ConfigOption[] = useMemo(
    () => [
      {
        name: "Editar dashboard",
        icon: <EditGrid className={styles.configOptionButton} />,
        action: handleEditDashboard,
        enabled: true,
      },
      {
        name: "Auto-ordenar layout",
        icon: <ReloadIcon className={styles.configOptionButton} />,
        action: handleAutoSortDashboard,
        enabled: true,
      },
    ],
    [handleEditDashboard, handleAutoSortDashboard],
  );

  return (
    <div className={styles.dashboardContainer}>
      <section className={styles.section1}>
        <div className={styles.header}>
          <section className={styles.homeContainer}>
            <div className={styles.homeSubContainer}>
              <h1 className={styles.homeTitle}>
                <span>{greeting}, </span>
                <span>{displayName}</span>
              </h1>
              <div className={styles.homeTimeContainer}>
                <p>
                  <span>Hoy es </span>
                  {formattedDate} <br />
                  <span>Aquí tienes un resumen de tu productividad</span>
                </p>
              </div>
            </div>
            <div className={styles.configSection}>
              <AnimatePresence mode="wait">
                {isEdit ? (
                  <motion.button
                    key="finish-btn"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    onClick={handleFinishEdit}
                    className={styles.checkButton}
                    aria-label="Guardar cambios"
                  >
                    <Check
                      style={{
                        width: "16px",
                        height: "auto",
                        stroke: "var(--text)",
                        strokeWidth: 2,
                      }}
                    />
                    Finalizar
                  </motion.button>
                ) : (
                  <motion.div
                    key="config-btns"
                    initial={{ opacity: 0, scale: 0.8, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8, x: -10 }}
                    style={{ display: "flex", gap: "5px" }}
                  >
                    <button
                      onClick={() => setShowGallery(true)}
                      title="Galería de widgets"
                      className={styles.galleryButton}
                    >
                      <GridPlusIcon className={styles.buttonConfig} />
                    </button>
                    <ConfigMenu
                      iconWidth="25px"
                      configOptions={configOptions}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </section>

      <main className={styles.dashboardContent}>
        {!isConfigLoaded ? null : bentoItems.length > 0 ? (
          <DraggableBentoGrid
            items={bentoItems}
            isEdit={isEdit}
            setIsEdit={setIsEdit}
            tempLayout={effectiveLayout}
            setTempLayout={handleSetTempLayout}
          />
        ) : (
          <section className={styles.withoutWidgetsSection}>
            <div className={styles.withoutWidgets}>
              <p>
                Tu dashboard está vacía, puedes navegar por la galería de
                widgets para instalar los que más te gusten.
              </p>
              <button onClick={() => setShowGallery(true)}>
                Descubrir widgets
              </button>
            </div>
          </section>
        )}
      </main>

      {showGallery && (
        <WidgetGallery
          onClose={() => setShowGallery(false)}
          userTier={userTier}
        />
      )}
    </div>
  );
};
