import { z } from "zod";

export const hexColorSchema = z.string().refine(
  (value) => {
    return /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(value);
  },
  {
    message: "Formato inválido. Debe ser: #RGB, #RGBA, #RRGGBB o #RRGGBBAA",
  }
);

const shortcodeEmojiSchema = z
  .string()
  .refine(
    (value) => {
      // Regex que valida la estructura :palabra:
      return /^:[a-z0-9_]+(?:(?:-[a-z0-9_]+)+)?:$/.test(value);
    },
    {
      message: "Formato inválido. Debe ser: :ejemplo: o :ejemplo_123:",
    }
  )
  .nullable();

export const ListSchema = z.object({
  index: z.number().int().min(0),
  color: hexColorSchema,
  name: z
    .string()
    .min(1, "El nombre de la lista debe tener al menos 1 carácter")
    .max(25, "El nombre de las listas debe tener menos de 25 caracteres"),
  shortcodeemoji: shortcodeEmojiSchema,
  id: z
    .string()
    .uuid("Hubo un problema con la validación de la ID, intentalo nuevamente"),
  pinned: z.boolean(),
});
