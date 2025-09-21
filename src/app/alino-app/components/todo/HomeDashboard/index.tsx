"use client";

// import DraggableBentoGrid, {
//   BentoItem,
// } from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";
import styles from "./HomeDashboard.module.css";
import { DashboardData } from "@/lib/schemas/database.types";
import { Summary } from "./parts/Summary";
import { UpcomingTask } from "./parts/UpcomingTasks";
import DraggableBentoGrid from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";
import { useEffect, useMemo } from "react";
import { useTopBlurEffectStore } from "@/store/useTopBlurEffectStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { NewFeature } from "./parts/NewFeatures";
import { Weather } from "./parts/Weather";

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
}

export const HomeDashboard = () => {
  const setBlurredFx = useTopBlurEffectStore((state) => state.setColor);
  const user = useUserDataStore((state) => state.user);

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
    },
    {
      id: "weather",
      title: "Clima",
      content: <Weather />,
    },
    {
      id: "new-features",
      title: "Nuevo en Alino",
      content: <NewFeature />,
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
          </section>
        </div>
      </section>

      <main className={styles.dashboardContent}>
        <DraggableBentoGrid items={bentoItems} />
      </main>
    </div>
  );
};
