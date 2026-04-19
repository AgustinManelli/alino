"use client";
import { useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Editor } from "@tiptap/react";

import { EnhanceAction, AIGeneratedTask } from "@/lib/ai/aiProvider";
import { useAIEnhance } from "@/hooks/useAIEnhance";
import { useAITaskGeneration } from "@/hooks/useAITaskGeneration";
import { useModalUbication } from "@/hooks/useModalUbication";
import { ClientOnlyPortal } from "@/components/ui/ClientOnlyPortal";

import { useUserDataStore } from "@/store/useUserDataStore";
import { useModalStore } from "@/store/useModalStore";
import { Tabs, TabOption } from "@/components/ui/Tabs/Tabs";
import { AIShadowEffect } from "@/components/ui/AIShadowEffect/AIShadowEffect";

import {
  Check,
  CompressIcon,
  Cross,
  Crown,
  ExpandIcon,
  FixIcon,
  IAStars,
  Note,
  SquircleIcon,
} from "@/components/ui/icons/icons";
import { IAStarsLoader } from "../icons/ia-loader";
import styles from "./AIEnhanceButton.module.css";

const ENHANCE_ACTIONS: {
  id: EnhanceAction;
  label: string;
  Icon?: React.ElementType;
  emoji?: string;
}[] = [
  {
    id: "improve",
    label: "Mejorar",
    Icon: IAStars,
  },
  {
    id: "summarize",
    label: "Resumir",
    Icon: CompressIcon,
  },
  {
    id: "expand",
    label: "Expandir",
    Icon: ExpandIcon,
  },
  {
    id: "fix",
    label: "Corregir",
    Icon: FixIcon,
  },
];

const MAX_TASKS_OPTIONS = [3, 5, 7] as const;
const DEFAULT_MAX_TASKS = 5;

type Tab = "enhance" | "generate";

type EnhanceFlow =
  | { phase: "idle" }
  | { phase: "loading"; action: EnhanceAction }
  | { phase: "result"; result: string }
  | { phase: "error"; message: string };

type GenerateFlow =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "result"; tasks: AIGeneratedTask[]; listSubject: string }
  | { phase: "creating" }
  | { phase: "success"; count: number }
  | { phase: "error"; message: string };

export interface AIEnhanceButtonProps {
  editor: Editor | null;
  visible: boolean;
  onCreateTasks?: (
    tasks: AIGeneratedTask[],
  ) => Promise<{ error: string | null }>;
  showGenerateTasks?: boolean;
  className?: string;
}

export function AIEnhanceButton({
  editor,
  visible,
  onCreateTasks,
  showGenerateTasks = true,
  className,
}: AIEnhanceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("enhance");
  const [enhanceFlow, setEnhanceFlow] = useState<EnhanceFlow>({
    phase: "idle",
  });
  const [generateFlow, setGenerateFlow] = useState<GenerateFlow>({
    phase: "idle",
  });
  const [taskPrompt, setTaskPrompt] = useState("");
  const [maxTasks, setMaxTasks] = useState<number>(DEFAULT_MAX_TASKS);

  const tabOptions: TabOption[] = [
    { id: "enhance", label: "Mejorar texto" },
    { id: "generate", label: "Generar tareas" },
  ];

  const openModal = useModalStore((s) => s.open);

  const user = useUserDataStore((s) => s.user);
  const userTier = (user as any)?.tier || "free";
  const canGenerateTasks = userTier === "pro" || userTier === "student";

  const { enhance } = useAIEnhance();
  const { generate, loading: genLoading } = useAITaskGeneration();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const closePanel = useCallback(() => {
    setIsOpen(false);
    setEnhanceFlow({ phase: "idle" });
    setGenerateFlow({ phase: "idle" });
  }, []);

  const handleOpenPremiumModal = () => {
    openModal({ type: "premium" });
  };

  useModalUbication(triggerRef, containerRef, closePanel, false);

  const handleEnhance = async (action: EnhanceAction) => {
    if (!editor) return;
    const plainText = editor.getText().trim();
    if (!plainText) return;

    setEnhanceFlow({ phase: "loading", action });
    const result = await enhance(plainText, action);

    if (!result) {
      setEnhanceFlow({
        phase: "error",
        message: "No se pudo obtener respuesta.",
      });
      setTimeout(() => setEnhanceFlow({ phase: "idle" }), 3_000);
      return;
    }
    setEnhanceFlow({ phase: "result", result });
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enhanceFlow.phase !== "result" || !editor) return;
    editor.commands.setContent(`<p>${enhanceFlow.result}</p>`);
    editor.commands.focus("end");
    closePanel();
  };

  const handleGenerate = async () => {
    if (!taskPrompt.trim() || !canGenerateTasks) return;
    setGenerateFlow({ phase: "loading" });

    const data = await generate(taskPrompt.trim(), maxTasks);

    if (!data || !data.tasks.length) {
      setGenerateFlow({
        phase: "error",
        message: "No se pudieron generar tareas.",
      });
      setTimeout(() => setGenerateFlow({ phase: "idle" }), 3_000);
      return;
    }
    setGenerateFlow({
      phase: "result",
      tasks: data.tasks,
      listSubject: data.listSubject,
    });
  };

  const handleCreateTasks = async () => {
    if (generateFlow.phase !== "result" || !onCreateTasks) return;

    const { tasks } = generateFlow;
    setGenerateFlow({ phase: "creating" });

    const { error } = await onCreateTasks(tasks);

    if (error) {
      setGenerateFlow({ phase: "error", message: error });
      setTimeout(() => setGenerateFlow({ phase: "idle" }), 4_000);
      return;
    }

    setGenerateFlow({ phase: "success", count: tasks.length });
    setTaskPrompt("");

    setTimeout(() => closePanel(), 1_800);
  };

  const isEnhanceLoading = enhanceFlow.phase === "loading";
  const isGenerating = generateFlow.phase === "loading" || genLoading;
  const isCreating = generateFlow.phase === "creating";
  const isAnyLoading = isEnhanceLoading || isGenerating || isCreating;

  const formatDate = (iso: string | null) => {
    if (!iso) return null;
    try {
      return new Date(iso).toLocaleDateString("es-AR", {
        weekday: "short",
        day: "numeric",
        month: "short",
      });
    } catch {
      return null;
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.wrapper}
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
        >
          <div className={styles.btnWrapper}>
            <button
              ref={triggerRef}
              className={`${styles.mainBtn} ${isAnyLoading ? styles.loading : ""} ${className || ""}`.trim()}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((v) => !v);
              }}
              title="Asistente IA"
              aria-label="Abrir asistente IA"
              disabled={isAnyLoading}
            >
              <IAStars
                style={
                  {
                    "--ai-color": isOpen ? "var(--text)" : "var(--icon-color)",
                  } as React.CSSProperties
                }
                className={styles.aiIcon}
              />
            </button>
          </div>

          <ClientOnlyPortal>
            <AnimatePresence mode="wait">
              {isOpen && (
                <motion.div
                  ref={containerRef}
                  className={`${styles.panel} no-close-edit`}
                  id="ai-enhance-panel"
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{
                    opacity: { duration: 0.14 },
                    scale: { duration: 0.14 },
                    y: { duration: 0.14 },
                  }}
                >
                  <AIShadowEffect
                    visible={
                      enhanceFlow.phase === "loading" ||
                      generateFlow.phase === "loading" ||
                      generateFlow.phase === "creating"
                    }
                  />

                  {/* Header */}
                  <div className={styles.panelHeader}>
                    <IAStars
                      style={{
                        width: "12px",
                        height: "12px",
                        stroke: "var(--icon-colorv2)",
                        opacity: 0.55,
                      }}
                    />
                    <span className={styles.panelTitle}>Asistente IA</span>
                  </div>

                  {/* Tabs */}
                  {showGenerateTasks && (
                    <Tabs
                      options={tabOptions}
                      activeTab={activeTab}
                      onChange={(id) => setActiveTab(id as Tab)}
                      className={styles.tabs}
                      disabled={isAnyLoading}
                    />
                  )}

                  <div className={styles.divisor} />

                  {/*Enhance tab*/}
                  {activeTab === "enhance" && (
                    <div className={styles.tabContent}>
                      {enhanceFlow.phase === "idle" && (
                        <div className={styles.actionList}>
                          {ENHANCE_ACTIONS.map((a) => (
                            <button
                              key={a.id}
                              className={styles.actionItem}
                              onClick={() => handleEnhance(a.id)}
                              disabled={!editor?.getText().trim()}
                            >
                              <span className={styles.actionEmoji}>
                                {a.Icon ? (
                                  <a.Icon className={styles.actionIcon} />
                                ) : (
                                  a.emoji
                                )}
                              </span>
                              <span className={styles.actionLabel}>
                                {a.label}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {enhanceFlow.phase === "loading" && (
                        <div className={styles.loadingState}>
                          <IAStarsLoader size={32} />
                        </div>
                      )}

                      {enhanceFlow.phase === "result" && (
                        <div className={styles.resultBody}>
                          <p className={styles.resultText}>
                            {enhanceFlow.result}
                          </p>
                          <div className={styles.resultActions}>
                            <button
                              className={styles.acceptBtn}
                              onMouseDown={handleAccept}
                            >
                              <Check className={styles.checkIcon} /> Aceptar
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => setEnhanceFlow({ phase: "idle" })}
                            >
                              <Cross className={styles.crossIcon} /> Descartar
                            </button>
                          </div>
                        </div>
                      )}

                      {enhanceFlow.phase === "error" && (
                        <p className={styles.errorText}>
                          {enhanceFlow.message}
                        </p>
                      )}
                    </div>
                  )}

                  {activeTab === "generate" && (
                    <div className={styles.tabContent}>
                      {!canGenerateTasks ? (
                        <div className={styles.upgradeContainer}>
                          <div className={styles.upgradeCrown}>
                            <Crown className={styles.crownIcon} />
                            Función Premium
                          </div>
                          <p className={styles.upgradeDesc}>
                            Desbloqueá la generación automática de tareas y
                            mucho más.
                          </p>
                          <button
                            className={styles.upgradeBtn}
                            onClick={handleOpenPremiumModal}
                          >
                            Mejorar mi plan
                          </button>
                        </div>
                      ) : (
                        <>
                          {(generateFlow.phase === "idle" ||
                            generateFlow.phase === "error") && (
                            <>
                              <textarea
                                className={styles.promptTextarea}
                                placeholder="Genera las tareas que necesites para esta lista."
                                value={taskPrompt}
                                onChange={(e) => setTaskPrompt(e.target.value)}
                                rows={4}
                                maxLength={1_500}
                              />
                              <div className={styles.generateOptions}>
                                <span className={styles.maxLabel}>
                                  Máx. tareas:
                                </span>
                                <div className={styles.maxOptions}>
                                  {MAX_TASKS_OPTIONS.map((n) => (
                                    <button
                                      key={n}
                                      className={`${styles.maxBtn} ${maxTasks === n ? styles.maxBtnActive : ""}`}
                                      onClick={() => setMaxTasks(n)}
                                    >
                                      {n}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              {generateFlow.phase === "error" && (
                                <p className={styles.errorTextInline}>
                                  {generateFlow.message}
                                </p>
                              )}
                              <button
                                className={styles.generateBtn}
                                onClick={handleGenerate}
                                disabled={!taskPrompt.trim()}
                              >
                                <IAStars
                                  style={{
                                    width: "12px",
                                    height: "12px",
                                    stroke: "currentColor",
                                  }}
                                />
                                Generar tareas
                              </button>
                            </>
                          )}

                          {generateFlow.phase === "loading" && (
                            <div className={styles.loadingState}>
                              <IAStarsLoader size={32} />
                            </div>
                          )}

                          {generateFlow.phase === "result" && (
                            <div className={styles.tasksResult}>
                              <div className={styles.tasksList}>
                                {generateFlow.tasks.map((task, i) => (
                                  <div
                                    key={i}
                                    className={styles.taskPreviewItem}
                                  >
                                    <span className={styles.taskTypeIcon}>
                                      {task.type === "check" ? (
                                        <SquircleIcon />
                                      ) : (
                                        <Note />
                                      )}
                                    </span>
                                    <div className={styles.taskPreviewContent}>
                                      <span className={styles.taskPreviewText}>
                                        {task.text}
                                      </span>
                                      {task.target_date && (
                                        <span
                                          className={styles.taskPreviewDate}
                                        >
                                          {formatDate(task.target_date)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className={styles.resultActions}>
                                <button
                                  className={styles.acceptBtn}
                                  onClick={handleCreateTasks}
                                  disabled={!onCreateTasks}
                                >
                                  <Check className={styles.checkIcon} />
                                  Crear{" "}
                                  {generateFlow.tasks.length > 1
                                    ? "tareas"
                                    : "tarea"}
                                </button>
                                <button
                                  className={styles.cancelBtn}
                                  onClick={() => {
                                    setGenerateFlow({ phase: "idle" });
                                    setTaskPrompt("");
                                  }}
                                >
                                  <Cross className={styles.crossIcon} />
                                  Descartar
                                </button>
                              </div>
                            </div>
                          )}

                          {generateFlow.phase === "creating" && (
                            <div className={styles.loadingState}>
                              <IAStarsLoader size={32} />
                              <p>Creando tareas...</p>
                            </div>
                          )}

                          {generateFlow.phase === "success" && (
                            <div className={styles.successState}>
                              <motion.div
                                initial={{ scale: 0.7, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 20,
                                }}
                                className={styles.successIcon}
                              >
                                <Check className={styles.successIcon} />
                              </motion.div>
                              <p className={styles.successText}>
                                {generateFlow.count} tareas creadas
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </ClientOnlyPortal>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
