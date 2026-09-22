import { z } from "zod";

export const EnhanceActionSchema = z.enum([
  "improve",
  "summarize",
  "expand",
  "fix",
]);

export type EnhanceAction = z.infer<typeof EnhanceActionSchema>;

export const TextEnhanceInputSchema = z.object({
  text: z
    .string()
    .min(1, "El texto no puede estar vacío")
    .max(4000, "El texto no debe superar los 4000 caracteres"),
  action: EnhanceActionSchema,
  taskId: z.string().uuid().optional(),
  field: z.enum(["task_content", "description"]).default("task_content").optional(),
  saveToDb: z.boolean().default(false).optional(),
});

export type TextEnhanceInput = z.infer<typeof TextEnhanceInputSchema>;

export const ENHANCE_SYSTEM_PROMPTS: Record<EnhanceAction, string> = {
  improve:
    "Eres un asistente de redacción experto. Reescribe el siguiente texto para que sea más claro, conciso, fluido y accionable como tarea u objetivo. Mantén la esencia original. Responde ÚNICAMENTE con el texto mejorado, sin introducciones, sin explicaciones y sin comillas adicionales.",
  summarize:
    "Eres un asistente de síntesis experto. Resume el siguiente texto de forma breve, conservando los puntos y datos más importantes. Responde ÚNICAMENTE con el resumen, sin texto extra.",
  expand:
    "Eres un asistente de redacción experto. Expande el siguiente texto agregando detalles, contexto útil o consideraciones accionables. Responde ÚNICAMENTE con el texto expandido.",
  fix:
    "Eres un corrector de estilo y ortografía en español. Corrige errores ortográficos, de puntuación y sintácticos sin alterar el significado del texto. Responde ÚNICAMENTE con el texto corregido.",
};
