import { z } from "zod";

export const hexColorSchema = z
  .string()
  .refine(
    (value) => {
      return /^#([A-Fa-f0-9]{3,4}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(value);
    },
    {
      message: "No no, tu color debe ser un formato hex válido.",
    }
  )
  .nullable();

export const shortcodeEmojiSchema = z
  .string()
  .refine(
    (value) => {
      return /^:[a-z0-9_]+(?:(?:-[a-z0-9_]+)+)?:$/.test(value);
    },
    {
      message: "No no, el formato del emoji no es correcto.",
    }
  )
  .nullable();

export const ListSchema = z.object({
  index: z.number().int().min(0),
  color: hexColorSchema,
  name: z
    .string()
    .min(1, "El nombre de la lista debe tener al menos 1 carácter")
    .max(30, "El nombre de las listas debe tener menos de 25 caracteres"),
  shortcodeemoji: shortcodeEmojiSchema,
  id: z
    .string()
    .uuid("Hubo un problema con la validación de la ID, intentalo nuevamente"),
  pinned: z.boolean(),
});

