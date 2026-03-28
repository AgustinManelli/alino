export type EnhanceAction = "improve" | "summarize" | "expand" | "fix";

/** Tarea estructurada generada por la IA */
export interface AIGeneratedTask {
  text: string;          // Texto plano de la tarea
  type: "note" | "check";
  target_date: string | null; // ISO 8601 o null
}

export interface AIProvider {
  /**
   * Mejora un texto según la acción indicada.
   */
  enhance(text: string, action: EnhanceAction): Promise<string>;

  /**
   * Genera un array de tareas a partir de un prompt del usuario.
   * @param prompt   - Objetivo o situación descrita por el usuario
   * @param maxTasks - Máximo de tareas a generar
   */
  generateTasks(prompt: string, maxTasks: number): Promise<AIGeneratedTask[]>;
}

// Prompts por acción (compartidos entre providers)
export const ACTION_PROMPTS: Record<EnhanceAction, string> = {
  improve:
    "Reescribe el siguiente texto para que sea más claro, conciso y accionable como tarea. Mantén la esencia original. Responde SOLO con el texto mejorado, sin explicaciones ni comillas.",
  summarize:
    "Resume el siguiente texto de forma breve, conservando la información más importante. Responde SOLO con el resumen, sin explicaciones ni comillas.",
  expand:
    "Expande el siguiente texto agregando más detalle y contexto útil. Responde SOLO con el texto expandido, sin explicaciones ni comillas.",
  fix: "Corrige la ortografía y gramática del siguiente texto sin cambiar su significado. Responde SOLO con el texto corregido, sin explicaciones ni comillas.",
};
