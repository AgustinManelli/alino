import { z } from "zod";

export const APP_PALETTE_COLORS = [
  "#ff0048",
  "#f54275",
  "#ff00ea",
  "#c800ff",
  "#87189d",
  "#0000ff",
  "#0693e3",
  "#2ccce4",
  "#00ffbf",
  "#00ff00",
  "#7ed321",
  "#a6ff00",
  "#d4ff00",
  "#ffdd00",
  "#ffae00",
  "#ff6900",
  "#ff4500",
  "#ff0000",
] as const;

export const TaskPlanningItemSchema = z.object({
  text: z
    .string()
    .min(1, "El texto de la tarea no puede estar vacío")
    .max(300, "El texto no debe superar los 300 caracteres")
    .describe("Descripción concisa, directa y accionable de la tarea en español"),
  type: z
    .enum(["check", "note"])
    .default("check")
    .describe("'check' para tareas completables o 'note' para apuntes/recordatorios"),
  target_date: z
    .string()
    .nullable()
    .optional()
    .describe("Fecha y hora límite en formato estricto ISO 8601 UTC o null si no aplica"),
});

export type TaskPlanningItem = z.infer<typeof TaskPlanningItemSchema>;

export const HierarchicalListItemSchema = z.object({
  listName: z
    .string()
    .min(1)
    .max(30, "El título de la lista no debe superar 30 caracteres")
    .describe("Título representativo y corto para la lista"),
  color: z
    .string()
    .default("#87189d")
    .describe("Color hexadecimal de la lista (ej: #0693e3, #ff6900, #7ed321)"),
  icon: z
    .string()
    .nullable()
    .optional()
    .describe("Emoji en formato shortcode (ej: :books:, :laptop:, :memo:, :house:, :shopping_cart:) o null"),
  tasks: z
    .array(TaskPlanningItemSchema)
    .min(1, "Debe generarse al menos una tarea")
    .max(35, "Máximo 35 tareas por lista")
    .describe("Array de tareas ordenadas lógica y cronológicamente"),
});

export type HierarchicalListItem = z.infer<typeof HierarchicalListItemSchema>;

export const HierarchicalFolderItemSchema = z.object({
  folderName: z
    .string()
    .min(1)
    .max(30, "El nombre de la carpeta no debe superar 30 caracteres")
    .describe("Nombre de la carpeta de agrupación temática"),
  color: z
    .string()
    .default("#87189d")
    .describe("Color hexadecimal de la carpeta"),
  lists: z
    .array(HierarchicalListItemSchema)
    .min(1, "Una carpeta debe contener al menos 1 lista")
    .max(10, "Máximo 10 listas por carpeta")
    .describe("Listas temáticas dentro de esta carpeta"),
});

export type HierarchicalFolderItem = z.infer<typeof HierarchicalFolderItemSchema>;

export const HierarchicalPlanningOutputSchema = z.object({
  folders: z
    .array(HierarchicalFolderItemSchema)
    .default([])
    .describe("Carpetas creadas para agrupar proyectos o ámbitos diferentes"),
  standaloneLists: z
    .array(HierarchicalListItemSchema)
    .default([])
    .describe("Listas creadas en la raíz (sin carpeta contenedora)"),
});

export type HierarchicalPlanningOutput = z.infer<typeof HierarchicalPlanningOutputSchema>;

export const TaskPlanningOutputSchema = z.object({
  listSubject: z.string().min(1).max(30).optional(),
  tasks: z.array(TaskPlanningItemSchema).min(1).max(35).optional(),
  folders: z.array(HierarchicalFolderItemSchema).optional(),
  standaloneLists: z.array(HierarchicalListItemSchema).optional(),
});

export type TaskPlanningOutput = z.infer<typeof TaskPlanningOutputSchema>;

export const TaskPlanningInputSchema = z.object({
  prompt: z
    .string()
    .min(3, "El prompt debe tener al menos 3 caracteres")
    .max(2000, "El prompt no debe superar los 2000 caracteres"),
  maxTasks: z.number().int().min(1).max(35).nullable().optional(),
  color: z.string().max(9).optional(),
  icon: z.string().max(50).nullable().optional(),
  folderId: z.string().uuid().nullable().optional(),
  saveToDb: z.boolean().default(true).optional(),
});

export type TaskPlanningInput = z.infer<typeof TaskPlanningInputSchema>;
