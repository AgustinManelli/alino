export type EnhanceAction = "improve" | "summarize" | "expand" | "fix";

export interface AIGeneratedTask {
  text: string;
  type: "note" | "check";
  target_date: string | null;
}

export interface AITaskGenerationResponse {
  listSubject: string;
  tasks: AIGeneratedTask[];
}

export interface AITaskSplitResponse {
  tasks: AIGeneratedTask[];
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
  generateTasks(prompt: string, maxTasks: number | null): Promise<AITaskGenerationResponse>;

  /**
   * Divide una tarea existente en subtareas más pequeñas y completables.
   * @param taskContent  - Contenido de la tarea a dividir (texto plano)
   * @param maxSubtasks  - Máximo de subtareas a generar
   */
  splitTask(taskContent: string, maxSubtasks: number): Promise<AITaskSplitResponse>;
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

export const SPLIT_TASK_SYSTEM_PROMPT = `Eres un asistente de productividad personal. El usuario te dará una tarea y debes dividirla en subtareas más pequeñas, concretas y completables.

Responde ÚNICAMENTE con un JSON válido con esta estructura exacta:
{
  "tasks": [
    {
      "text": "Descripción concisa de la subtarea (máx 200 caracteres, en español)",
      "type": "check",
      "target_date": null
    }
  ]
}

Reglas estrictas:
- type="check" → subtareas accionables y completables
- type="note" → recordatorios o contexto importante
- target_date → usa null (el usuario puede editarlo después)
- Genera entre 2 y el máximo indicado de subtareas. Nunca generes 1 ni más del máximo.
- Cada subtarea debe ser más pequeña y específica que la original
- El texto debe ser en español, directo y accionable
- Responde SOLO el JSON, sin texto adicional, sin markdown`;

