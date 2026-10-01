"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ResponsiveLayouts } from "react-grid-layout";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useUIStore } from "@/store/useUIStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useSyncStore } from "@/store/useSyncStore";
import { useLoadDashboard } from "@/hooks/dashboard/useLoadDashboard";
import { useDashboardLayoutActions } from "@/hooks/dashboard/useDashboardLayoutActions";
import { useSaveWidgetLayouts } from "@/hooks/dashboard/useSaveWidgetLayouts";
import { useUninstallWidget } from "@/hooks/dashboard/useUninstallWidget";

import { tierSatisfies, isWidgetOnlineOnly } from "@/config/widgets.registry";
import { getWidgetComponent } from "@/config/widgetRegistry";
import WIDGET_UI_META from "@/config/widgetUiMeta";

import { useTranslation } from "react-i18next";
import { getWidgetTranslation } from "@/lib/i18n/helpers";
import { UpgradePlaceholder } from "./parts/UpgradePlaceholder";
import { OfflinePlaceholder } from "./parts/OfflinePlaceholder";
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
  const { t, i18n } = useTranslation(["widgets"]);
  return useMemo(() => {
    const now = new Date();
    const hour = now.getHours();
    const locale = i18n.language?.startsWith("en") ? "en-US" : "es-ES";
    const rawDate = now.toLocaleDateString(locale, {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
    const formattedDate = rawDate.charAt(0).toUpperCase() + rawDate.slice(1);
    const greeting =
      hour < 12
        ? t("widgets:dashboard.greetings.morning", "Buen día")
        : hour < 19
          ? t("widgets:dashboard.greetings.afternoon", "Buenas tardes")
          : t("widgets:dashboard.greetings.evening", "Buenas noches");
    return { formattedDate, greeting };
  }, [i18n.language, t]);
};

export const HomeDashboard = () => {
  const { t, i18n } = useTranslation(["widgets"]);
  const setBlurredFx = useUIStore((state) => state.setColor);
  const user = useUserDataStore((state) => state.user);
  const isOnline = useSyncStore((state) => state.isOnline);

  const { layout, isConfigLoaded, setLayout, widgetInstances } =
    useDashboardStore();

  const { autoSortLayout } = useDashboardLayoutActions();
  const { uninstallWidget } = useUninstallWidget();

  const { loadDashboard } = useLoadDashboard();

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
    };
    init();
  }, [loadDashboard]);

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

  const isBentoItem = (item: BentoItem | null): item is BentoItem =>
    item !== null;

  const bentoItems: BentoItem[] = useMemo(() => {
    return widgetInstances
      .filter(
        (inst) =>
          inst.isInstalled &&
          inst.pwIsActive !== false &&
          inst.widgetKey !== "weather",
      )
      .map((inst): BentoItem | null => {
        if (inst.widgetSource === "predefined") {
          const key = inst.componentKey ?? inst.widgetKey;
          const WidgetComponent = getWidgetComponent(key);

          if (!WidgetComponent) return null;

          const meta = WIDGET_UI_META[key] ?? {
            icon: null,
            color: "#6366f1",
          };

          const isAllowed = tierSatisfies(
            userTier,
            inst.pwTierRequired ?? "free",
          );

          const requiresOnline = isWidgetOnlineOnly(key, inst.widgetSource);

          const localized = getWidgetTranslation({
            id: inst.widgetKey,
            name: inst.pwName,
            description: inst.pwDescription,
            localizedName: inst.pwLocalizedName,
            localizedDescription: inst.pwLocalizedDescription,
          });

          if (!isOnline && requiresOnline) {
            return {
              id: inst.widgetKey,
              title: localized.name,
              icon: meta.icon,
              color: meta.color,
              content: (
                <OfflinePlaceholder
                  widgetName={localized.name}
                />
              ),
              withoutTopPadding: meta.withoutTopPadding ?? false,
              withoutHeader: meta.withoutHeader ?? false,
              scrollable: false,
            };
          }

          return {
            id: inst.widgetKey,
            title: localized.name,
            icon: meta.icon,
            color: meta.color,
            content: isAllowed ? (
              <WidgetComponent instanceId={inst.instanceId} isEdit={isEdit} />
            ) : (
              <UpgradePlaceholder widgetName={localized.name} />
            ),
            withoutTopPadding: meta.withoutTopPadding ?? false,
            withoutHeader: meta.withoutHeader ?? false,
            scrollable: meta.scrollable ?? false,
          };
        }

        if (inst.widgetSource === "embedded" && inst.uwUrl) {
          if (!isOnline) {
            return {
              id: inst.widgetKey,
              title: inst.uwTitle ?? "Widget",
              icon: <Link style={{ width: "16px" }} />,
              color: "#6366f1",
              content: (
                <OfflinePlaceholder
                  widgetName={inst.uwTitle ?? "Widget embebido"}
                  reason={t(
                    "widgets:offlinePlaceholder.embeddedReason",
                    "Los widgets embebidos requieren conexión a internet para cargar su contenido.",
                  )}
                />
              ),
              withoutTopPadding: true,
              withoutHeader: false,
              scrollable: false,
            };
          }

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
  }, [widgetInstances, userTier, isEdit, isOnline, t, i18n.language]);

  const displayName = useMemo(
    () =>
      user?.display_name?.split(" ")[0] ??
      t("widgets:dashboard.defaultUser", "Bienvenido"),
    [user?.display_name, t],
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

  const { saveLayouts } = useSaveWidgetLayouts();

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
      saveLayouts(newInstances);
    }
    setIsEdit(false);
  }, [layout, tempLayout, setLayout, saveLayouts]);

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
        name: t("widgets:dashboard.actions.editDashboard", "Editar dashboard"),
        icon: <EditGrid className={styles.configOptionButton} />,
        action: handleEditDashboard,
        enabled: true,
      },
      {
        name: t("widgets:dashboard.actions.autoSort", "Reordenar widgets"),
        icon: <ReloadIcon className={styles.configOptionButton} />,
        action: handleAutoSortDashboard,
        enabled: true,
      },
    ],
    [handleEditDashboard, handleAutoSortDashboard, t],
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
                  <span>{t("widgets:dashboard.todayIs", "Hoy es")} </span>
                  {formattedDate} <br />
                  <span>
                    {t(
                      "widgets:dashboard.summarySubtitle",
                      "Aquí tienes un resumen de tu productividad",
                    )}
                  </span>
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
                    aria-label={t(
                      "widgets:dashboard.actions.saveChanges",
                      "Guardar cambios",
                    )}
                  >
                    <Check
                      style={{
                        width: "16px",
                        height: "auto",
                        stroke: "var(--text)",
                        strokeWidth: 2,
                      }}
                    />
                    {t("widgets:dashboard.actions.finish", "Finalizar")}
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
                      title={t(
                        "widgets:dashboard.actions.galleryTitle",
                        "Galería de widgets",
                      )}
                      aria-label={t(
                        "widgets:dashboard.actions.moreWidgets",
                        "Más widgets",
                      )}
                      className={styles.galleryButton}
                    >
                      <GridPlusIcon className={styles.buttonConfig} />
                      <span>
                        {t(
                          "widgets:dashboard.actions.moreWidgets",
                          "Más widgets",
                        )}
                      </span>
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
            onDelete={uninstallWidget}
          />
        ) : (
          <section className={styles.withoutWidgetsSection}>
            <div className={styles.withoutWidgets}>
              <p>
                {t(
                  "widgets:dashboard.empty.message",
                  "Tu dashboard está vacío. Puedes explorar la galería de widgets para instalar los que más te gusten.",
                )}
              </p>
              <button onClick={() => setShowGallery(true)}>
                {t("widgets:dashboard.empty.discoverBtn", "Descubrir widgets")}
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
