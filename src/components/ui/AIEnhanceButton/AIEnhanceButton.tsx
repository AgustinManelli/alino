"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Editor } from "@tiptap/react";
import { EnhanceAction, AIGeneratedTask } from "@/lib/ai/aiProvider";
import { useAIEnhance } from "@/hooks/useAIEnhance";
import { useAITaskGeneration } from "@/hooks/useAITaskGeneration";
import { useModalUbication } from "@/hooks/useModalUbication";
import { ClientOnlyPortal } from "@/components/ui/ClientOnlyPortal";
import { IAStars } from "@/components/ui/icons/icons";
import { useUserDataStore } from "@/store/useUserDataStore"; // Importamos el store
import styles from "./AIEnhanceButton.module.css";
import { IAStarsLoader } from "../icons/ia-loader";

const CheckIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "12px", height: "12px", flexShrink: 0 }}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const CloseIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.5}
    strokeLinecap="round"
    style={{ width: "11px", height: "11px", flexShrink: 0 }}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);
const CheckTaskIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "13px", height: "13px", flexShrink: 0, opacity: 0.6 }}
  >
    <rect x="3" y="3" width="18" height="18" rx="3" />
    <polyline points="9 12 11.5 14.5 15 10" />
  </svg>
);
const NoteTaskIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "13px", height: "13px", flexShrink: 0, opacity: 0.6 }}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="8" y1="13" x2="16" y2="13" />
    <line x1="8" y1="17" x2="12" y2="17" />
  </svg>
);

const ENHANCE_ACTIONS: { id: EnhanceAction; label: string; emoji: string }[] = [
  { id: "improve", label: "Mejorar", emoji: "✨" },
  { id: "summarize", label: "Resumir", emoji: "📝" },
  { id: "expand", label: "Expandir", emoji: "💬" },
  { id: "fix", label: "Corregir", emoji: "🔧" },
];

const MAX_TASKS_OPTIONS = [3, 5, 7];
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
  | { phase: "error"; message: string };

interface AIEnhanceButtonProps {
  editor: Editor | null;
  visible: boolean;
  onCreateTasks?: (tasks: AIGeneratedTask[]) => void;
  showGenerateTasks?: boolean;
}

export function AIEnhanceButton({
  editor,
  visible,
  onCreateTasks,
  showGenerateTasks = true,
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
  const [maxTasks, setMaxTasks] = useState(DEFAULT_MAX_TASKS);

  // Obtener usuario actual y tier
  const user = useUserDataStore((state) => state.user);
  const userTier = (user as any)?.tier || "free";
  const canGenerateTasks = userTier === "pro" || userTier === "student";

  const { enhance } = useAIEnhance();
  const { generate, loading: genLoading } = useAITaskGeneration();

  const triggerRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useModalUbication(
    triggerRef,
    containerRef,
    () => {
      setIsOpen(false);
      setEnhanceFlow({ phase: "idle" });
      setGenerateFlow({ phase: "idle" });
    },
    false,
  );

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
      setTimeout(() => setEnhanceFlow({ phase: "idle" }), 3000);
      return;
    }
    setEnhanceFlow({ phase: "result", result });
  };

  const handleAccept = (e: React.MouseEvent) => {
    e.preventDefault();
    if (enhanceFlow.phase !== "result" || !editor) return;
    const text = enhanceFlow.result;
    setIsOpen(false);
    setEnhanceFlow({ phase: "idle" });
    editor.commands.setContent(`<p>${text}</p>`);
    editor.commands.focus("end");
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
      setTimeout(() => setGenerateFlow({ phase: "idle" }), 3000);
      return;
    }
    setGenerateFlow({
      phase: "result",
      tasks: data.tasks,
      listSubject: data.listSubject,
    });
  };

  const handleCreateTasks = () => {
    if (generateFlow.phase !== "result") return;
    onCreateTasks?.(generateFlow.tasks);
    setIsOpen(false);
    setGenerateFlow({ phase: "idle" });
    setTaskPrompt("");
  };

  const isEnhanceLoading = enhanceFlow.phase === "loading";
  const isGenerating = generateFlow.phase === "loading" || genLoading;

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
            <motion.div
              className={styles.glow}
              animate={{
                rotate: 360,
                scale: isEnhanceLoading || isGenerating ? 1 : 0,
              }}
              transition={{
                rotate: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                },
                scale: {
                  delay: 0.1,
                  duration: 0.35,
                  ease: [0.22, 1, 0.36, 1],
                },
              }}
              initial={{ scale: 0, rotate: 0 }}
            />
            <button
              ref={triggerRef}
              className={`${styles.mainBtn} ${isEnhanceLoading || isGenerating ? styles.loading : ""}`}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen((v) => !v);
              }}
              title="Asistente IA"
              aria-label="Abrir asistente IA"
              disabled={isEnhanceLoading || isGenerating}
              style={{
                backgroundColor:
                  isEnhanceLoading || isGenerating
                    ? "var(--background-container)"
                    : "var(--background-over-container)",
              }}
            >
              <IAStarsLoader
                size={15}
                color={
                  isEnhanceLoading || isGenerating || isOpen
                    ? "#ffffff"
                    : "var(--icon-color)"
                }
                duration={2}
                title="Cargando IA"
                animated={isEnhanceLoading || isGenerating || isOpen}
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
                  transition={{ duration: 0.14, ease: "easeOut" }}
                >
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

                  {showGenerateTasks && (
                    <div className={styles.tabs}>
                      <button
                        className={`${styles.tab} ${activeTab === "enhance" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("enhance")}
                      >
                        Mejorar texto
                      </button>
                      <button
                        className={`${styles.tab} ${activeTab === "generate" ? styles.tabActive : ""}`}
                        onClick={() => setActiveTab("generate")}
                      >
                        Generar tareas
                      </button>
                    </div>
                  )}

                  <div className={styles.divisor} />

                  {activeTab === "enhance" && (
                    <div className={styles.tabContent}>
                      {/* ... Tu código actual de Enhance (idéntico) ... */}
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
                                {a.emoji}
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
                          <motion.div
                            className={styles.loadingDots}
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ duration: 1.2, repeat: Infinity }}
                          >
                            Procesando...
                          </motion.div>
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
                              <CheckIcon /> Aceptar
                            </button>
                            <button
                              className={styles.cancelBtn}
                              onClick={() => setEnhanceFlow({ phase: "idle" })}
                            >
                              <CloseIcon /> Descartar
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
                      {/* VALIDACIÓN DE TIER AQUÍ */}
                      {!canGenerateTasks ? (
                        <div className={styles.upgradeContainer}>
                          <p className={styles.upgradeTitle}>
                            Función Exclusiva
                          </p>
                          <p className={styles.upgradeDesc}>
                            Desbloqueá la generación automática de tareas y
                            mucho más pasando a Pro o Estudiante.
                          </p>
                          <button className={styles.upgradeBtn}>
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
                                placeholder="Ej: Tengo un examen de álgebra el viernes, ayudame a organizar el estudio..."
                                value={taskPrompt}
                                onChange={(e) => setTaskPrompt(e.target.value)}
                                rows={4}
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
                                <p className={styles.errorText}>
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
                              <motion.div
                                className={styles.loadingDots}
                                animate={{ opacity: [0.4, 1, 0.4] }}
                                transition={{ duration: 1.2, repeat: Infinity }}
                              >
                                Generando tareas...
                              </motion.div>
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
                                        <CheckTaskIcon />
                                      ) : (
                                        <NoteTaskIcon />
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
                                >
                                  <CheckIcon /> Crear{" "}
                                  {generateFlow.tasks.length} tareas
                                </button>
                                <button
                                  className={styles.cancelBtn}
                                  onClick={() => {
                                    setGenerateFlow({ phase: "idle" });
                                    setTaskPrompt("");
                                  }}
                                >
                                  <CloseIcon /> Descartar
                                </button>
                              </div>
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
