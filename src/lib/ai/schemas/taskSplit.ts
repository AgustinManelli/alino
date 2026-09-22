import { z } from "zod";

export const TaskSplitItemSchema = z.object({
  text: z
    .string()
    .min(1)
    .max(200, "La subtarea no debe superar los 200 caracteres")
    .describe("Descripción concisa de la subtarea en español"),
  type: z
    .enum(["check", "note"])
    .default("check")
    .describe("Tipo de tarea"),
  target_date: z
    .string()
    .nullable()
    .optional()
    .describe("Fecha ISO 8601 o null"),
});

export type TaskSplitItem = z.infer<typeof TaskSplitItemSchema>;

export const TaskSplitOutputSchema = z.object({
  tasks: z
    .array(TaskSplitItemSchema)
    .min(2, "Debe dividirse al menos en 2 subtareas")
    .max(10, "Máximo 10 subtareas permitidas"),
});

export type TaskSplitOutput = z.infer<typeof TaskSplitOutputSchema>;

export const TaskSplitInputSchema = z.object({
  taskContent: z.string().min(1, "El contenido de la tarea es requerido").max(2000),
  maxSubtasks: z.number().int().min(2).max(10).default(5),
  listId: z.string().uuid().optional(),
  taskRank: z.string().nullable().optional(),
  prevTaskRank: z.string().nullable().optional(),
  saveToDb: z.boolean().default(false).optional(),
});

export type TaskSplitInput = z.infer<typeof TaskSplitInputSchema>;
