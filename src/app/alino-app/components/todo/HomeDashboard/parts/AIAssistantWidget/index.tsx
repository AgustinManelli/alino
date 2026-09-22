"use client";
import React, { useState, useCallback, useMemo } from "react";
import { useAITaskGeneration } from "@/hooks/useAITaskGeneration";
import { IAStars } from "@/components/ui/icons/icons";
import { motion, AnimatePresence } from "motion/react";
import styles from "./AIAssistantWidget.module.css";
import { useUserDataStore } from "@/store/useUserDataStore";
import { IAStarsLoader } from "@/components/ui/icons/ia-loader";
import { customToast } from "@/lib/toasts";
import { useWidgetPreview } from "@/context/WidgetPreviewContext";
import { AIAssistantWidgetPreview } from "./AIAssistantWidgetPreview";
import { useModalStore } from "@/store/useModalStore";
import { hasAIFeatureAccess } from "@/lib/ai/permissions";

export default function AIAssistantWidget() {
  const isPreview = useWidgetPreview();
  const [prompt, setPrompt] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("Tu plan y tareas ya están guardados en tu cuenta.");
  const {
    generateAndCreateList,
    error: aiError,
    loading: isProcessing,
  } = useAITaskGeneration();
  const openModal = useModalStore((state) => state.open);
  const user = useUserDataStore((state) => state.user);

  const canGenerateTasks = useMemo(
    () => hasAIFeatureAccess(user?.tier, "assistant_widget"),
    [user?.tier],
  );

  if (isPreview) {
    return <AIAssistantWidgetPreview />;
  }

  const handleGenerateList = useCallback(async () => {
    if (!prompt.trim() || !canGenerateTasks || isProcessing) return;

    try {
      const { data, error } = await generateAndCreateList({
        prompt: prompt.trim(),
      });

      if (error || !data) {
        throw new Error(error || "No se pudo generar la estructura de trabajo.");
      }

      const folderCount = data.folders?.length || 0;
      const listCount = data.lists?.length || 1;
      const taskCount = data.tasks?.length || 0;

      let msg = "";
      if (folderCount > 0) {
        msg = `¡Estructura creada! ${folderCount} carpeta${folderCount > 1 ? "s" : ""}, ${listCount} lista${listCount > 1 ? "s" : ""} y ${taskCount} tareas organizadas.`;
      } else if (listCount > 1) {
        msg = `¡${listCount} listas creadas con ${taskCount} tareas organizadas!`;
      } else {
        msg = `¡Lista "${data.list?.list?.list_name || "Plan"}" creada con ${taskCount} tareas!`;
      }

      setSuccessMsg(msg);
      setSuccess(true);
      setPrompt("");
      customToast.success(msg);
    } catch (err) {
      customToast.error((err as Error).message);
    }
  }, [prompt, canGenerateTasks, isProcessing, generateAndCreateList]);

  const maxLength = 2000;
  const currentLength = prompt.length;

  return (
    <div className={styles.container}>
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
              <IAStars
                style={{
                  width: 24,
                  height: 24,
                  stroke: "#4ade80",
                  strokeWidth: 2,
                }}
              />
              <h4 className={styles.successTitle}>¡Todo listo!</h4>
              <p className={styles.successDesc}>
                {successMsg}
              </p>
              <button
                className={styles.resetBtn}
                onClick={() => setSuccess(false)}
              >
                Planificar más
              </button>
            </motion.div>
          ) : isProcessing ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.loadingState}
            >
              <IAStarsLoader
                size={40}
                color="#ec489a"
                duration={2}
                title="Cargando IA"
              />
              <span className={styles.loadingDots}>Diseñando y organizando estructura...</span>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={styles.textareaContainer}
            >
              {(!canGenerateTasks || aiError) && (
                <div className={styles.errorState}>
                  {!canGenerateTasks ? (
                    <div className={styles.upgradeNotice}>
                      <span>Función exclusiva para usuarios Pro y Ultra.</span>
                      <button
                        type="button"
                        className={styles.upgradeNoticeBtn}
                        onClick={() => openModal({ type: "premium" })}
                      >
                        Mejorar plan
                      </button>
                    </div>
                  ) : (
                    aiError
                  )}
                </div>
              )}
              <textarea
                className={styles.textarea}
                placeholder="Ej. Organiza mi mes: tengo 2 exámenes de la facultad y una mudanza..."
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
                  <IAStars style={{ width: 15, height: 15, strokeWidth: 2 }} />
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
