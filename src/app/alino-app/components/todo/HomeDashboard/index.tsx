"use client";

// import DraggableBentoGrid, {
//   BentoItem,
// } from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";
import styles from "./HomeDashboard.module.css";
import { DashboardData } from "@/lib/schemas/todo-schema";
import { Summary } from "./parts/Summary";
import { UpcomingTask } from "./parts/UpcomingTasks";
import DraggableBentoGrid from "@/components/ui/DraggableBentoGrid/DraggableBentoGrid";

// Componente de clima
const WeatherWidget = () => (
  <div className={styles.weatherWidget}>
    <div className={styles.weatherIcon}>☀️</div>
    <div className={styles.weatherInfo}>
      <div className={styles.temperature}>24°C</div>
      <div className={styles.weatherDescription}>Soleado</div>
    </div>
  </div>
);

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
    {count > 0 && (
      <div className={styles.overdueAlert}>⚠️ Requieren atención inmediata</div>
    )}
  </div>
);

export interface BentoItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

export const HomeDashboard = ({
  data: dashboardData,
}: {
  data: DashboardData;
}) => {
  const bentoItems: BentoItem[] = [
    {
      id: "summary",
      title: "Resumen de Tareas",
      content: <Summary dashboardData={dashboardData} />,
    },
    {
      id: "upcoming-tasks",
      title: "Próximas Tareas",
      content: <UpcomingTask tasks={dashboardData.upcoming_tasks} />,
    },
    {
      id: "new-features",
      title: "Nuevo en Alino",
      content: (
        <div className={styles.newFeatures}>
          <div className={styles.featureIcon}>✨</div>
          <div className={styles.featureContent}>
            <h4 className={styles.featureTitle}>Arrastrar y soltar</h4>
            <p className={styles.featureDescription}>
              Ahora puedes reorganizar tu dashboard como quieras
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "overdue-tasks",
      title: "Tareas Vencidas",
      content: <OverdueTasksWidget count={dashboardData.overdue_tasks} />,
    },
    {
      id: "today-tasks",
      title: "Tareas de Hoy",
      content: <TodayTasksWidget count={8} />,
    },
    {
      id: "weather",
      title: "Clima",
      content: <WeatherWidget />,
    },
  ];

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.welcomeSection}>
          <div>
            <h1 className={styles.welcomeTitle}>¡Hola de nuevo!</h1>
            <p className={styles.welcomeSubtitle}>
              Aquí tienes un resumen de tu productividad
            </p>
          </div>
        </div>
      </header>

      <main className={styles.dashboardContent}>
        <DraggableBentoGrid
          items={bentoItems}
          // onItemsReorder={(newItems) => {
          //   console.log(
          //     "Nuevo orden:",
          //     newItems.map((item) => item.id)
          //   );
          //   // Aquí podrías guardar el orden en localStorage o base de datos
          // }}
        />
      </main>
    </div>
  );
};
