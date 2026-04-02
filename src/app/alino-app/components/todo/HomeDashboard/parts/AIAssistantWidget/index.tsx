"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAITaskGeneration } from "@/hooks/useAITaskGeneration";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { IAStars } from "@/components/ui/icons/icons";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import styles from "./AIAssistantWidget.module.css";
import { useUserStore } from "@/components/providers/UserStoreProvider";
import { IAStarsLoader } from "@/components/ui/icons/ia-loader";

export default function AIAssistantWidget() {
  const [prompt, setPrompt] = useState("");
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [success, setSuccess] = useState(false);
  const { generate, error: aiError } = useAITaskGeneration();
  const insertList = useTodoDataStore((state) => state.insertList);
  const addTasks = useTodoDataStore((state) => state.addTasks);
  const user = useUserStore((state) => state.user);
  const canGenerateTasks = user?.tier === "pro" || user?.tier === "student";

  const handleGenerateList = async () => {
    if (!prompt.trim() || !canGenerateTasks) return;
    setLoadingLocal(true);
    try {
      const data = await generate(prompt.trim(), null);
      if (!data || !data.tasks.length) {
        throw new Error(aiError || "No se pudieron generar tareas.");
      }
      const title = data.listSubject || "Lista Generada por IA";
      const { error: listError, list_id } = await insertList(
        title,
        "#87189d",
        null,
      );
      if (listError || !list_id) {
        throw new Error("Ocurrió un error creando la lista contenedor.");
      }
      const tasksToInsert = data.tasks.map((t) => ({
        list_id: list_id,
        task_content: `<p>${t.text}</p>`,
        target_date: t.target_date,
        note: t.type === "note",
      }));
      const { error: taskError } = await addTasks(tasksToInsert);
      if (taskError) {
        throw new Error(
          "Ocurrió un problema añadiendo las tareas a la nueva lista.",
        );
      }
      setSuccess(true);
      setPrompt("");
      toast.success("¡Lista y tareas generadas exitosamente!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoadingLocal(false);
    }
  };

  const currentLength = prompt.length;
  const maxLength = 2000;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <IAStarsLoader
          size={15}
          color="#e2a5ff"
          duration={2}
          title="Cargando IA"
          strokeWidth={1}
        />
        {/* <IAStars style={{ width: 14, height: 14, stroke: "#b48cff" }} /> */}
        <h3 className={styles.title}>Planificador IA</h3>
      </div>
      <div className={styles.content}>
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.successState}
            >
              <IAStars style={{ width: 24, height: 24, stroke: "#4ade80" }} />
              <h4 className={styles.successTitle}>¡Todo listo!</h4>
              <p className={styles.successDesc}>
                Revisa tu nueva lista en la barra lateral.
              </p>
              <button
                className={styles.resetBtn}
                onClick={() => setSuccess(false)}
              >
                Planificar más
              </button>
            </motion.div>
          ) : loadingLocal ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.loadingState}
            >
              <IAStarsLoader
                size={40}
                color="#b48cff"
                duration={2}
                title="Cargando IA"
              />
              <span className={styles.loadingDots}>Generando plan...</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.textareaContainer}
            >
              {!canGenerateTasks && (
                <div className={styles.errorState}>
                  Función exclusiva para usuarios Pro y Estudiantes.
                </div>
              )}
              <textarea
                className={styles.textarea}
                placeholder="Ej. Organiza mi examen para la semana que viene de los siguientes temas..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={maxLength}
                disabled={!canGenerateTasks}
              />
              <div className={styles.actions}>
                <span className={styles.charCount}>
                  {currentLength}/{maxLength}
                </span>
                <button
                  className={styles.submitBtn}
                  disabled={!prompt.trim() || !canGenerateTasks}
                  onClick={handleGenerateList}
                >
                  <IAStars
                    style={{ width: 15, height: 15, stroke: "#b48cff" }}
                  />
                  Generar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
