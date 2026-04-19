"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { getBatchInjectedState } from "@/store/todoUtils";
import { useAITaskSplit } from "@/hooks/useAITaskSplit";
import { WindowModal } from "../WindowModal";
import { customToast } from "@/lib/toasts";
import { AIShadowEffect } from "../AIShadowEffect/AIShadowEffect";
import type { AIGeneratedTask } from "@/lib/ai/aiProvider";

import { IAStarsLoader } from "../icons/ia-loader";
import { Cross, SquircleIcon } from "../icons/icons";

import styles from "./SplitTaskModal.module.css";

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
  const [retryKey, setRetryKey] = useState(0);

  const updateState = useTodoDataStore((s) => s.updateState);
  const tasks = useTodoDataStore((s) => s.tasks);
  const lists = useTodoDataStore((s) => s.lists);

  useEffect(() => {
    let cancelled = false;

    const doPreview = async () => {
      setPhase("loading");
      const { data, error } = await split.preview(taskContent, 5);
      if (cancelled) return;
      if (error || !data || data.tasks.length === 0) {
        setErrorMessage(
          error ?? "No se pudo dividir la tarea. Intentá nuevamente.",
        );
        setPhase("error");
        return;
      }
      setPreviewTasks(data.tasks);
      setCredits(data.credits.remaining);
      setPhase("preview");
    };

    doPreview();
    return () => {
      cancelled = true;
    };
  }, [retryKey, taskContent]);

  const handleRetry = useCallback(() => {
    setRetryKey((k) => k + 1);
    setErrorMessage(null);
    setPreviewTasks([]);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (phase !== "preview") return;
    setPhase("confirming");
    const { data: result, error } = await split.confirm(
      previewTasks,
      listId,
      taskRank,
      prevTaskRank,
    );
    if (error || !result) {
      setErrorMessage(error ?? "Error al crear las subtareas.");
      setPhase("error");
      return;
    }
    const { tasks: updatedTasks, lists: updatedLists } = getBatchInjectedState(
      result.tasks,
      tasks,
      lists,
    );
    updateState({ tasks: updatedTasks, lists: updatedLists });
    onClose();
    customToast.success(
      `✦ ${result.tasks.length} subtarea${result.tasks.length !== 1 ? "s" : ""} creada${result.tasks.length !== 1 ? "s" : ""}`,
      credits !== null
        ? `Te quedan ${credits} crédito${credits !== 1 ? "s" : ""} IA`
        : undefined,
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

  const contentByPhase = {
    loading: {
      title: "Dividiendo tarea...",
      subtitle: "Estamos analizando la tarea con IA",
    },
    preview: {
      title: `${previewTasks.length} subtareas generadas`,
      subtitle: "Revisá las subtareas antes de crearlas",
    },
    confirming: {
      title: "Creando subtareas...",
      subtitle: "Guardando cambios",
    },
    error: {
      title: "No se pudo dividir",
      subtitle: "Intentá nuevamente más tarde",
    },
  };

  const { title, subtitle } = contentByPhase[phase] ?? {
    title: "",
    subtitle: "",
  };

  return (
    <WindowModal
      crossButton={false}
      closeAction={onClose}
      ignoreClass="ignore-debug-click"
    >
      <div className={styles.modalContent}>
        <AIShadowEffect
          visible={phase === "loading" || phase === "confirming"}
        />

        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{title}</h2>
            <p className={styles.subtitle}>{subtitle}</p>
          </div>
          <button className={styles.closeButton} onClick={onClose}>
            <Cross />
          </button>
        </div>

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
              <button className={styles.confirmButton} onClick={handleConfirm}>
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
    </WindowModal>
  );
};
