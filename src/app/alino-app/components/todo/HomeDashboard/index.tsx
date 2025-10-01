"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Layouts } from "react-grid-layout";

import { useDashboardStore } from "@/store/useDashboardStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useTopBlurEffectStore } from "@/store/useTopBlurEffectStore";

import { Pomodoro } from "./parts/Pomodoro";
import { Summary } from "./parts/Summary";
import { Weather } from "./parts/Weather";
import { UpcomingTask } from "./parts/UpcomingTasks";
import { NewFeature } from "./parts/NewFeatures";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { DraggableBentoGrid } from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";

import { HomeLayouts } from "@/components/ui/DraggableBentoGrid/layout.helper";

import { Check, EditGrid, ReloadIcon } from "@/components/ui/icons/icons";
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
  const setLayout = useDashboardStore((state) => state.setLayout);
  const layout = useDashboardStore((state) => state.layout);

  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [tempLayout, setTempLayout] = useState<Layouts>(layout);

  const { formattedDate, greeting } = useDateAndGreeting();

  useEffect(() => {
    setBlurredFx(BLUR_COLOR);
  }, [setBlurredFx]);

  const bentoItems: BentoItem[] = useMemo(
    () => [
      {
        id: "summary",
        title: "Resumen de Tareas",
        content: <Summary />,
      },
      {
        id: "upcoming-tasks",
        title: "Próximas Tareas",
        content: <UpcomingTask />,
        scrollable: true,
      },
      {
        id: "weather",
        title: "Clima",
        content: <Weather />,
        withoutTopPadding: true,
        withoutHeader: true,
      },
      {
        id: "new-features",
        title: "Nuevo en Alino",
        content: <NewFeature />,
        withoutTopPadding: true,
        withoutHeader: true,
      },
      {
        id: "pomodoro",
        title: "Pomodoro",
        content: <Pomodoro />,
        withoutTopPadding: true,
        withoutHeader: true,
      },
    ],
    []
  );

  const displayName = useMemo(
    () => user?.display_name?.split(" ")[0] ?? "Bienvenido",
    [user?.display_name]
  );

  const handleEditDashboard = useCallback(() => {
    setIsEdit(true);
  }, []);

  const handleResetDashboard = useCallback(() => {
    const newLayout = { ...HomeLayouts };
    setTempLayout(newLayout);
    setLayout(newLayout);
  }, [setLayout]);

  const configOptions: ConfigOption[] = useMemo(
    () => [
      {
        name: "Editar dashboard",
        icon: <EditGrid style={ICON_CONFIG} />,
        action: handleEditDashboard,
        enabled: true,
      },
      {
        name: "Reiniciar dashboard",
        icon: <ReloadIcon style={ICON_CONFIG} />,
        action: handleResetDashboard,
        enabled: true,
      },
    ],
    [handleEditDashboard, handleResetDashboard]
  );

  const handleFinishEdit = useCallback(() => {
    const layoutsAreEqual = (layout1: Layouts, layout2: Layouts): boolean => {
      try {
        return JSON.stringify(layout1) === JSON.stringify(layout2);
      } catch {
        return false;
      }
    };

    if (layoutsAreEqual(layout, tempLayout)) {
      setIsEdit(false);
      return;
    }

    setIsEdit(false);
    setLayout(tempLayout);
  }, [layout, tempLayout, setLayout]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsEdit(false);
        setTempLayout(layout);
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

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
                <button onClick={handleFinishEdit}>
                  <Check style={EDIT_BUTTON_ICON_CONFIG} />
                </button>
              )}
              <ConfigMenu iconWidth={"25px"} configOptions={configOptions} />
            </div>
          </section>
        </div>
      </section>

      <main className={styles.dashboardContent}>
        <DraggableBentoGrid
          items={bentoItems}
          isEdit={isEdit}
          setIsEdit={setIsEdit}
          tempLayout={tempLayout}
          setTempLayout={setTempLayout}
        />
      </main>
    </div>
  );
};
