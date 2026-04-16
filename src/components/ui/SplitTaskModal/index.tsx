"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { getBatchInjectedState } from "@/store/todoUtils";
import { useAITaskSplit } from "@/hooks/useAITaskSplit";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { SquircleIcon } from "../icons/icons";
import { IAStarsLoader } from "../icons/ia-loader";
import styles from "./SplitTaskModal.module.css";
import type { AIGeneratedTask } from "@/lib/ai/aiProvider";

type SplitPhase = "loading" | "preview" | "confirming" | "error";

interface Props {
  taskContent: string;
  taskId: string;
  listId: string;
  taskRank: string | null;
  prevTaskRank: string | null;
  onClose: () => void;
}

export const SplitTaskModal = ({
  taskContent,
  listId,
  taskRank,
  prevTaskRank,
  onClose,
}: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  const split = useAITaskSplit();

  const [phase, setPhase] = useState<SplitPhase>("loading");
  const [previewTasks, setPreviewTasks] = useState<AIGeneratedTask[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);

  const updateState = useTodoDataStore((s) => s.updateState);
  const tasks = useTodoDataStore((s) => s.tasks);
  const lists = useTodoDataStore((s) => s.lists);

  // Carga inicial
  useEffect(() => {
    let cancelled = false;

    const doPreview = async () => {
      const result = await split.preview(taskContent, 5);
      if (cancelled) return;
      if (!result || result.tasks.length === 0) {
        setErrorMessage(
          split.error ?? "No se pudo dividir la tarea. Intentá nuevamente.",
        );
        setPhase("error");
        return;
      }
      setPreviewTasks(result.tasks);
      setCredits(result.credits.remaining);
      setPhase("preview");
    };

    doPreview();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRetry = useCallback(() => {
    setPhase("loading");
    setErrorMessage(null);
    setPreviewTasks([]);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (phase !== "preview") return;
    setPhase("confirming");
    const result = await split.confirm(
      previewTasks,
      listId,
      taskRank,
      prevTaskRank,
    );
    if (!result) {
      setErrorMessage(split.error ?? "Error al crear las subtareas.");
      setPhase("error");
      return;
    }
    const { tasks: updatedTasks, lists: updatedLists } = getBatchInjectedState(
      result.tasks,
      tasks,
      lists
    );
    updateState({ tasks: updatedTasks, lists: updatedLists });
    onClose();
    toast.success(
      `✦ ${result.tasks.length} subtarea${result.tasks.length !== 1 ? "s" : ""} creada${result.tasks.length !== 1 ? "s" : ""}`,
      {
        description:
          credits !== null
            ? `Te quedan ${credits} crédito${credits !== 1 ? "s" : ""} IA`
            : undefined,
      },
    );
  }, [
    phase,
    previewTasks,
    listId,
    taskRank,
    prevTaskRank,
    split,
    updateState,
    tasks,
    lists,
    onClose,
    credits,
  ]);

  const canClose = phase !== "loading" && phase !== "confirming";

  useOnClickOutside(ref, () => {
    if (canClose) onClose();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canClose) onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [canClose, onClose]);

  return (
    <ClientOnlyPortal>
      <motion.div
        className={`${styles.backdrop} ignore-sidebar-close`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { duration: 0.2 } }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
      >
        <div className={styles.container} ref={ref}>
          <div className={styles.header}>
            <div className={styles.headerText}>
              <p className={styles.title}>
                {phase === "loading" && "Dividiendo tarea..."}
                {phase === "preview" &&
                  `${previewTasks.length} subtareas generadas`}
                {phase === "confirming" && "Creando subtareas..."}
                {phase === "error" && "No se pudo dividir"}
              </p>
              <p className={styles.subtitle}>
                Divide tu tarea en tareas más pequeñas con IA
              </p>
            </div>
            {canClose && (
              <button
                className={styles.closeButton}
                onClick={onClose}
                aria-label="Cerrar"
              >
                ×
              </button>
            )}
          </div>

          <div className={styles.divider} />

          {(phase === "loading" || phase === "confirming") && (
            <div className={styles.loadingArea}>
              <IAStarsLoader size={40} />
            </div>
          )}

          {phase === "preview" && (
            <>
              <ul className={styles.taskList}>
                {previewTasks.map((t, i) => (
                  <motion.li
                    key={i}
                    className={styles.taskItem}
                    initial={{ opacity: 0, x: -6 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <span className={styles.squircleIcon}>
                      <SquircleIcon />
                    </span>
                    <span className={styles.taskText}>{t.text}</span>
                  </motion.li>
                ))}
              </ul>
              <div className={styles.divider} />
              <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>
                  Descartar
                </button>
                <button
                  className={styles.confirmButton}
                  onClick={handleConfirm}
                >
                  ✦ Crear {previewTasks.length} subtarea
                  {previewTasks.length !== 1 ? "s" : ""}
                </button>
              </div>
            </>
          )}

          {phase === "error" && (
            <>
              <p className={styles.errorText}>{errorMessage}</p>
              <div className={styles.actions}>
                <button className={styles.cancelButton} onClick={onClose}>
                  Cerrar
                </button>
                <button className={styles.retryButton} onClick={handleRetry}>
                  Reintentar
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </ClientOnlyPortal>
  );
};
