"use client";

// import DraggableBentoGrid, {
//   BentoItem,
// } from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";
import styles from "./HomeDashboard.module.css";
import { DashboardData } from "@/lib/schemas/database.types";
import { Summary } from "./parts/Summary";
import { UpcomingTask } from "./parts/UpcomingTasks";
import DraggableBentoGrid from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";
import { useEffect, useMemo, useState } from "react";
import { useTopBlurEffectStore } from "@/store/useTopBlurEffectStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { NewFeature } from "./parts/NewFeatures";
import { Weather } from "./parts/Weather";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { Check, Edit } from "@/components/ui/icons/icons";
import { useDashboardStore } from "@/store/useDashboardStore";
import { Layouts } from "react-grid-layout";
import { HomeLayouts } from "@/components/ui/DraggableBentoGrid/layout.helper";
import { Pomodoro } from "./parts/Pomodoro";

// Componente de tareas del día
const TodayTasksWidget = ({ count }: { count: number }) => (
  <div className={styles.todayTasks}>
    <div className={styles.taskCount}>
      <span className={styles.taskNumber}>{count}</span>
      <span className={styles.taskLabel}>tareas para hoy</span>
    </div>
    <div className={styles.taskProgress}>
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: "60%" }}></div>
      </div>
      <span className={styles.progressText}>60% completado</span>
    </div>
  </div>
);

// Componente de tareas vencidas
const OverdueTasksWidget = ({ count }: { count: number }) => (
  <div className={styles.overdueTasks}>
    <div className={styles.overdueHeader}>
      <span className={styles.overdueCount}>{count}</span>
      <span className={styles.overdueLabel}>
        tarea{count > 1 ? "s" : ""} vencida{count > 1 ? "s" : ""}
      </span>
    </div>
  </div>
);

export interface BentoItem {
  id: string;
  title: string;
  content: React.ReactNode;
  withoutTopPadding?: boolean;
  withoutHeader?: boolean;
  scrollable?: boolean;
}

export const HomeDashboard = () => {
  const setBlurredFx = useTopBlurEffectStore((state) => state.setColor);
  const user = useUserDataStore((state) => state.user);
  const setLayout = useDashboardStore((state) => state.setLayout);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const layout = useDashboardStore((state) => state.layout);
  const [tempLayout, setTempLayout] = useState<Layouts>(layout);

  useEffect(() => {
    setBlurredFx("rgb(106, 195, 255)");
  }, []);

  const bentoItems: BentoItem[] = [
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
    // {
    //   id: "overdue-tasks",
    //   title: "Tareas Vencidas",
    //   content: <OverdueTasksWidget count={dashboardData.overdue_tasks} />,
    // },
    // {
    //   id: "today-tasks",
    //   title: "Tareas de Hoy",
    //   content: <TodayTasksWidget count={8} />,
    // },
  ];

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("es-ES", {
      weekday: "long",
      // year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buen día";
    if (hour < 19) return "Buenas tardes";
    return "Buenas noches";
  }, []);

  const displayName = useMemo(
    () => user?.display_name.split(" ")[0] ?? "Bienvenido",
    [user]
  );

  const configOptions = useMemo(() => {
    const baseOptions = [
      {
        name: "Editar dashboard",
        icon: <Edit style={iconStyle} />,
        action: () => {
          setIsEdit(true);
        },
        enabled: true,
      },
      {
        name: "Reiniciar dashboard",
        icon: <Edit style={iconStyle} />,
        action: () => {
          setTempLayout(HomeLayouts);
          setLayout(HomeLayouts);
        },
        enabled: true,
      },
    ];
    return baseOptions.filter((option) => option.enabled);
  }, []);

  const handleFinishEdit = () => {
    if (layout === tempLayout) return;
    setIsEdit(false);
    setLayout(tempLayout);
  };

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
                  <Check
                    style={{
                      width: "20px",
                      height: "auto",
                      stroke: "var(--icon-color)",
                      strokeWidth: 2,
                    }}
                  />
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

const iconStyle = {
  width: "14px",
  height: "auto",
  stroke: "var(--text)",
  strokeWidth: 2,
};
