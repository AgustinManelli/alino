"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import styles from "./EditTaskModal.module.css";
import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";
import { useTodoDataStore } from "@/store/useTodoDataStore";

export const EditTaskModal = () => {
  const {
    isOpen,
    task: modalTask,
    initialRect,
    closeModal,
    onConfirm,
  } = useEditTaskModalStore();

  const modalTaskId = modalTask?.task_id ?? null;

  // leemos la lista completa de tareas desde la store global
  const tasks = useTodoDataStore((s) => s.tasks);

  // buscamos la tarea sincronizada en la store por id
  const syncedTask = useMemo(
    () =>
      modalTaskId
        ? (tasks.find((t) => t.task_id === modalTaskId) ?? null)
        : null,
    [tasks, modalTaskId]
  );

  // Prevenir scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Calcular la posición y dimensiones iniciales
  const initialAnimation = initialRect
    ? {
        x: initialRect.left - 15,
        y: initialRect.top - 15,
        width: initialRect.width,
        height: initialRect.height,
      }
    : {
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
        width: 0,
        height: 0,
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Fondo con blur */}
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
          />

          {/* Contenido del modal */}
          <motion.div
            className={styles.modalContainer}
            initial={initialAnimation}
            animate={{
              x:
                typeof window !== "undefined" ? window.innerWidth / 2 - 250 : 0,
              y:
                typeof window !== "undefined"
                  ? window.innerHeight / 2 - 200
                  : 0,
            }}
            exit={{
              x: initialAnimation.x,
              y: initialAnimation.y,
              width: initialAnimation.width,
              height: initialAnimation.height,
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            layout
          >
            {syncedTask && <TaskCard task={syncedTask} editionMode={true} />}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
