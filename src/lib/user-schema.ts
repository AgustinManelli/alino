import { object, string, TypeOf } from "zod";

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

export type CreateUserInput = TypeOf<typeof createUserSchema>;
export type LoginUserInput = TypeOf<typeof loginUserSchema>;
export type ResetUserInput = TypeOf<typeof resetUserSchema>;
export type UpdatePasswordInput = TypeOf<typeof updatePasswordScheme>;
