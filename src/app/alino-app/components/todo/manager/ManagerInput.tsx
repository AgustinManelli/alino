"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import TaskInput from "../task-input/task-input";
import { ListsType } from "@/lib/schemas/database.types";
import { Cross, TaskDoneIcon } from "@/components/ui/icons/icons";
import styles from "./manager.module.css";

interface ManagerInputProps {
  setList?: ListsType;
  h?: boolean;
  showCompleted: boolean;
  setShowCompleted: (val: boolean) => void;
  loadingCompleted: boolean;
}

export const ManagerInput = memo(function ManagerInput({
  setList,
  showCompleted,
  setShowCompleted,
  loadingCompleted,
}: ManagerInputProps) {
  const completedTasks = useTodoDataStore((state) => state.completedTasks);
  const hasMoreCompletedTasks = useTodoDataStore(
    (state) => state.hasMoreCompletedTasks,
  );

  return (
    <div className={styles.inputSection}>
      <AnimatePresence mode="wait" initial={false}>
        {showCompleted ? (
          <motion.div
            key="trash-banner"
            className={styles.trashBanner}
            initial={{ opacity: 0, y: 6 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
            }}
            exit={{
              opacity: 0,
              y: 6,
              transition: { duration: 0.15, ease: "easeIn" },
            }}
          >
            <div className={styles.trashBannerGlow} />
            <div className={styles.trashBannerLeft}>
              <TaskDoneIcon
                className={styles.trashBannerIcon}
                style={{
                  width: "14px",
                  height: "14px",
                  stroke: "hsl(340, 85%, 68%)",
                  strokeWidth: 2,
                }}
              />
              <span className={styles.trashBannerText}>Tareas completadas</span>
              <span className={styles.trashBannerSub}>
                {loadingCompleted
                  ? "Cargando..."
                  : completedTasks.length === 0
                    ? "Sin tareas completadas"
                    : `${completedTasks.length}${hasMoreCompletedTasks ? "+" : ""} tarea${completedTasks.length !== 1 ? "s" : ""}`}
              </span>
            </div>
            <button
              className={styles.trashBannerClose}
              onClick={() => setShowCompleted(false)}
              title="Cerrar tareas completadas"
            >
              <Cross
                style={{
                  width: "14px",
                  height: "14px",
                  stroke: "currentColor",
                  strokeWidth: 2.5,
                }}
              />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="task-input"
            initial={{ opacity: 0, y: -4 }}
            animate={{
              opacity: 1,
              y: 0,
              transition: { duration: 0.18, ease: "easeOut" },
            }}
            exit={{
              opacity: 0,
              y: -4,
              transition: { duration: 0.12, ease: "easeIn" },
            }}
          >
            <TaskInput setList={setList} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});
