export const AI_FEATURE_KEY = "ai_credits" as const;

export const AI_CREDIT_COSTS = {
  /** Mejorar / resumir / expandir / corregir texto */
  enhance: 1,
  /** Generar lista de tareas con IA */
  generateTasks: 3,
} as const;

export type AIOperation = keyof typeof AI_CREDIT_COSTS;