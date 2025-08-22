"use client";

import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import styles from "./EditTaskModal.module.css";
import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import ClientOnlyPortal from "../client-only-portal";

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

  const targetAnimation = useMemo(() => {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;
    const viewportHeight =
      typeof window !== "undefined" ? window.innerHeight : 800;

    const preferredWidth = initialRect?.width ?? 500;
    const MARGIN = 0;
    const MOBILE_BREAKPOINT = 600;
    const maxAvailable = Math.max(240, viewportWidth - MARGIN * 2);

    const targetWidth =
      viewportWidth < MOBILE_BREAKPOINT
        ? Math.min(preferredWidth, maxAvailable)
        : Math.min(Math.min(preferredWidth, 500), maxAvailable);

    const centeredX = Math.round(viewportWidth / 2 - targetWidth / 2);
    const minX = MARGIN;
    const maxX = Math.max(MARGIN, viewportWidth - targetWidth - MARGIN);
    const targetX =
      viewportWidth < MOBILE_BREAKPOINT
        ? minX
        : Math.min(Math.max(centeredX, minX), maxX);

    // mantenemos el mismo offset vertical que usabas (-200)
    const targetY = Math.round(viewportHeight / 2 - 200);

    return {
      x: targetX,
      y: targetY,
      // width: Math.round(targetWidth),
      transition: {
        delay: 0.01,
      },
    };
  }, [initialRect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ClientOnlyPortal>
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
            animate={targetAnimation}
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
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
