"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveLayouts } from "react-grid-layout";
import dynamic from "next/dynamic";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useTopBlurEffectStore } from "@/store/useTopBlurEffectStore";

import { tierSatisfies } from "@/config/widgets.registry";
import { UpgradePlaceholder } from "./parts/UpgradePlaceholder";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { DraggableBentoGrid } from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";

import {
  Check,
  EditGrid,
  ReloadIcon,
  GridPlusIcon,
} from "@/components/ui/icons/icons";
import styles from "./HomeDashboard.module.css";

const BLUR_COLOR = "rgb(106, 195, 255)";
const ICON_CONFIG = {
  width: "14px",
  height: "auto" as const,
  stroke: "var(--text)",
  strokeWidth: 2,
} as const;

const EDIT_BUTTON_ICON_CONFIG = {
  width: "20px",
  height: "auto" as const,
  stroke: "var(--icon-color)",
  strokeWidth: 2,
} as const;

const Summary = dynamic(
  () => import("./parts/Summary").then((mod) => mod.Summary),
  { ssr: false },
);
const UpcomingTask = dynamic(
  () => import("./parts/UpcomingTasks").then((mod) => mod.UpcomingTask),
  { ssr: false },
);
const Weather = dynamic(
  () => import("./parts/Weather").then((mod) => mod.Weather),
  { ssr: false },
);
const NewFeature = dynamic(
  () => import("./parts/NewFeatures").then((mod) => mod.NewFeature),
  { ssr: false },
);
const Pomodoro = dynamic(
  () => import("./parts/Pomodoro").then((mod) => mod.Pomodoro),
  { ssr: false },
);
const EmbeddedWidget = dynamic(
  () => import("./parts/EmbeddedWidget").then((mod) => mod.EmbeddedWidget),
  { ssr: false },
);
const AIAssistantWidget = dynamic(
  () => import("./parts/AIAssistantWidget").then((mod) => mod.default),
  { ssr: false },
);
const WidgetGallery = dynamic(
  () => import("./WidgetGallery/index").then((mod) => mod.WidgetGallery),
  { ssr: false },
);

const PREDEFINED_COMPONENTS: Record<string, React.ComponentType<any>> = {
  summary: Summary,
  "upcoming-tasks": UpcomingTask,
  weather: Weather,
  "new-features": NewFeature,
  pomodoro: Pomodoro,
  "ai-planner": AIAssistantWidget,
};

interface BentoItem {
  id: string;
  title: string;
  content: React.ReactNode;
  withoutTopPadding?: boolean;
  withoutHeader?: boolean;
  scrollable?: boolean;
}

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
  const setBlurredFx = useTopBlurEffectStore((state) => state.setColor);
  const user = useUserDataStore((state) => state.user);

  const {
    layout,
    isConfigLoaded,
    setLayout,
    autoSortLayout,
    loadDashboard,
    fetchDashboardData,
    fetchAppUpdates,
    widgetInstances,
    activeWidgets,
  } = useDashboardStore();

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
      .filter((inst) => inst.isInstalled)
      .map((inst): BentoItem | null => {
        if (inst.widgetSource === "predefined") {
          const WidgetComponent = PREDEFINED_COMPONENTS[inst.widgetKey];
          if (!WidgetComponent) return null;

          const isAllowed = tierSatisfies(
            userTier,
            inst.pwTierRequired ?? "free",
          );

          return {
            id: inst.widgetKey,
            title: inst.pwName ?? inst.widgetKey,
            content: isAllowed ? (
              <WidgetComponent />
            ) : (
              <UpgradePlaceholder widgetName={inst.pwName ?? ""} />
            ),
            withoutTopPadding: [
              "weather",
              "new-features",
              "pomodoro",
              "ai-planner",
            ].includes(inst.widgetKey),
            withoutHeader: [
              "weather",
              "new-features",
              "pomodoro",
              "ai-planner",
            ].includes(inst.widgetKey),
            scrollable: inst.widgetKey === "upcoming-tasks",
          };
        }

        if (inst.widgetSource === "embedded" && inst.uwUrl) {
          return {
            id: inst.widgetKey,
            title: inst.uwTitle ?? "Widget",
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

  const handleFinishEdit = useCallback(() => {
    if (JSON.stringify(layout) !== JSON.stringify(tempLayout)) {
      setLayout(tempLayout);
    }
    setIsEdit(false);
  }, [layout, tempLayout, setLayout]);

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
        icon: <EditGrid style={ICON_CONFIG} />,
        action: handleEditDashboard,
        enabled: true,
      },
      {
        name: "Auto-ordenar layout",
        icon: <ReloadIcon style={ICON_CONFIG} />,
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
              {isEdit && (
                <button
                  onClick={handleFinishEdit}
                  className={styles.saveButton}
                  aria-label="Guardar cambios"
                >
                  <Check style={EDIT_BUTTON_ICON_CONFIG} />
                </button>
              )}
              <button
                onClick={() => setShowGallery(true)}
                title="Galería de widgets"
                className={styles.galleryButton}
              >
                <GridPlusIcon style={EDIT_BUTTON_ICON_CONFIG} />
              </button>
              <ConfigMenu iconWidth="25px" configOptions={configOptions} />
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
