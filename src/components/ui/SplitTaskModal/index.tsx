"use client";

import { useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/shallow";
import { toast } from "sonner";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useSplitTaskModalStore } from "@/store/useSplitTaskModalStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useAITaskSplit } from "@/hooks/useAITaskSplit";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { SquircleIcon } from "../icons/icons";

import styles from "./SplitTaskModal.module.css";
import { IAStarsLoader } from "../icons/ia-loader";

export const SplitTaskModal = () => {
  const ref = useRef<HTMLDivElement>(null);
  const split = useAITaskSplit();

  const {
    isOpen,
    phase,
    taskContent,
    listId,
    taskRank,
    prevTaskRank,
    previewTasks,
    errorMessage,
    closeModal,
    setPhase,
    setPreviewTasks,
    setError,
  } = useSplitTaskModalStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      phase: state.phase,
      taskContent: state.taskContent,
      listId: state.listId,
      taskRank: state.taskRank,
      prevTaskRank: state.prevTaskRank,
      previewTasks: state.previewTasks,
      errorMessage: state.errorMessage,
      closeModal: state.closeModal,
      setPhase: state.setPhase,
      setPreviewTasks: state.setPreviewTasks,
      setError: state.setError,
    })),
  );

  const batchInjectTasks = useTodoDataStore((state) => state.batchInjectTasks);

  useEffect(() => {
    if (!isOpen || phase !== "loading") return;

    let cancelled = false;

    const doPreview = async () => {
      const result = await split.preview(taskContent, 5);
      if (cancelled) return;

      if (!result || result.tasks.length === 0) {
        setError(
          split.error ?? "No se pudo dividir la tarea. Intentá nuevamente.",
        );
        return;
      }
      setPreviewTasks(result.tasks, result.credits);
    };

    doPreview();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, phase]);

  const handleRetry = useCallback(() => {
    setPhase("loading");
  }, [setPhase]);

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
      setError(split.error ?? "Error al crear las subtareas.");
      return;
    }

    batchInjectTasks(result.tasks);
    const creditsRemaining = useSplitTaskModalStore.getState().creditsRemaining;
    closeModal();
    toast.success(
      `✦ ${result.tasks.length} subtarea${result.tasks.length !== 1 ? "s" : ""} creada${result.tasks.length !== 1 ? "s" : ""}`,
      {
        description:
          creditsRemaining !== null
            ? `Te quedan ${creditsRemaining} crédito${creditsRemaining !== 1 ? "s" : ""} IA`
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
    batchInjectTasks,
    closeModal,
    setPhase,
    setError,
  ]);

  const canClose = phase !== "loading" && phase !== "confirming";

  useOnClickOutside(ref, () => {
    if (isOpen && canClose) closeModal();
  });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && canClose) closeModal();
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, canClose, closeModal]);

  return (
    <AnimatePresence>
      {isOpen && (
        <ClientOnlyPortal>
          <motion.div
            className={`${styles.backdrop} ignore-sidebar-close`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 0.2 } }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <div className={styles.container} ref={ref}>
              <div className={styles.header}>
                {/* <div className={styles.headerIcon}>
                  <SplitIcon
                    style={{
                      width: "14px",
                      height: "14px",
                      stroke: "white",
                      strokeWidth: 2,
                    }}
                  />
                </div> */}
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
                    onClick={closeModal}
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
                    <button
                      className={styles.cancelButton}
                      onClick={closeModal}
                    >
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
                    <button
                      className={styles.cancelButton}
                      onClick={closeModal}
                    >
                      Cerrar
                    </button>
                    <button
                      className={styles.retryButton}
                      onClick={handleRetry}
                    >
                      Reintentar
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
