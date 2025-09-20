import { z } from "zod";

export const TaskSchema = z.object({
  id: z
    .string()
    .uuid("Hubo un problema con la validación de la ID, intentalo nuevamente"),
  name: z
    .string()
    .min(1, "El contenido de la tarea debe tener al menos 1 carácter")
    .max(200, "El contenido de las listas debe tener menos de 100 caracteres"),
  index: z.number().int().min(0),
  category_id: z
    .string()
    .uuid(
      "Hubo un problema con la validación de la ID de la lista, intentalo nuevamente"
    ),
  completed: z.boolean(),
  target_date: z.string().datetime({ offset: true }).nullable(),
});
