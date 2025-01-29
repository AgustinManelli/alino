import { z } from "zod";

export const ListSchema = z.object({
  index: z.number().int().min(0),
  color: z
    .string()
    .regex(
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/,
      "El color debe ser un código hexadecimal válido o un emoji"
    ),
  name: z
    .string()
    .min(1, "El nombre de la lista debe tener al menos 1 carácter")
    .max(25, "El nombre de las listas debe tener menos de 25 caracteres"),
  shortcodeemoji: z.string().nullable(),
  id: z
    .string()
    .uuid("Hubo un problema con la validación de la ID, intentalo nuevamente"),
  pinned: z.boolean(),
});
