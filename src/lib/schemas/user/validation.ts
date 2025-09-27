import z, { object, string, TypeOf } from "zod";

export const createUserSchema = object({
  email: string({
    required_error: "Ingrese el email",
  })
    .min(1, "Ingrese el email")
    .email("Email incorrecto"),
  password: string({ required_error: "Ingrese una contraseña" })
    .min(1, "Ingrese una contraseña")
    .min(6, "La contraseña debe contener mas de 6 caracteres")
    .max(32, "La contraseña debe contener menos de 32 caracteres"),
  passwordConfirm: string({
    required_error: "Porfavor, confirme su contraseña",
  }).min(1, "Porfavor, confirma tu contraseña"),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Las contraseñas no coinciden",
});

export const loginUserSchema = object({
  email: string({
    required_error: "Ingrese el email",
  })
    .min(1, "Ingrese el email")
    .email("Verifique su email"),
  password: string({ required_error: "Ingrese una contraseña" }).min(
    1,
    "Ingrese una contraseña"
  ),
});

export const resetUserSchema = object({
  email: string({ required_error: "Ingrese el email" })
    .min(1, "Ingrese el email")
    .email("Email incorrecto"),
});

export const updatePasswordScheme = object({
  password: string({ required_error: "Ingrese una contraseña" })
    .min(1, "Ingrese una contraseña")
    .min(6, "La contraseña debe contener mas de 6 caracteres")
    .max(32, "La contraseña debe contener menos de 32 caracteres"),
  passwordConfirm: string({
    required_error: "Porfavor, confirme su contraseña",
  }).min(1, "Porfavor, confirma tu contraseña"),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Las contraseñas no coinciden",
});

export const SearchUserSchema = z.object({
    user_id: z.string().uuid(),
    username: z.string(),
    display_name: z.string().nullable(),
    avatar_url: z.string().url().nullable(),
});

export const SearchTermSchema = z.string()
  .trim()
  .min(2, "El término de búsqueda debe tener al menos 2 caracteres.")
  .max(50, "El término de búsqueda no puede exceder 50 caracteres.")
  .regex(/[a-zA-Z0-9]/, "El término de búsqueda debe contener al menos un carácter alfanumérico.");


export const ERROR_MESSAGES: Record<string, string> = {
  USER_NOT_AUTHENTICATED: 'Usuario no autenticado',
  USERNAME_REQUIRED: 'El nombre de usuario es requerido',
  USERNAME_TOO_SHORT: 'El nombre de usuario debe tener al menos 3 caracteres',
  USERNAME_TOO_LONG: 'El nombre de usuario no puede exceder 30 caracteres',
  USERNAME_INVALID_FORMAT: 'Formato inválido. Solo se permiten letras, números y guiones (_-)',
  USERNAME_INVALID_START_END: 'No puede empezar o terminar con guiones o guiones bajos',
  USERNAME_RESERVED: 'Este nombre de usuario está reservado',
  USERNAME_TAKEN: 'Este nombre de usuario ya está en uso',
  USERNAME_ALREADY_CHANGED: 'Ya has cambiado tu nombre de usuario',
  USERNAME_SAME_AS_CURRENT: 'El nuevo nombre de usuario debe ser diferente al actual',
  USER_NOT_FOUND: 'Usuario no encontrado',
  UPDATE_FAILED: 'Error al actualizar el nombre de usuario',
  SERVER_ERROR: 'Error del servidor. Inténtalo nuevamente'
};

export const UsernameSchema = z.string({
    required_error: ERROR_MESSAGES.USERNAME_REQUIRED,
  })
  .trim()
  .min(3, ERROR_MESSAGES.USERNAME_TOO_SHORT)
  .max(30, ERROR_MESSAGES.USERNAME_TOO_LONG)
  .regex(/^[a-zA-Z0-9_-]+$/, ERROR_MESSAGES.USERNAME_INVALID_FORMAT)
  .refine(val => !val.startsWith('_') && !val.startsWith('-') && !val.endsWith('_') && !val.endsWith('-'), {
    message: ERROR_MESSAGES.USERNAME_INVALID_START_END,
  });

export const UsernameUpdateResultSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  username: z.string().optional(),
  error: z.string().optional(),
  error_code: z.string().optional(),
});

export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type ResetUserInput = TypeOf<typeof resetUserSchema>;
export type UpdatePasswordInput = TypeOf<typeof updatePasswordScheme>;
