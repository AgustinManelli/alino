"use client";

import {
  UpdatePasswordInput,
  updatePasswordScheme,
} from "@/lib/schemas/user-schema";
import { updatePassword, signOutLocal } from "@/lib/auth/actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthForm } from "../../components/auth-form";

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition();
  const methods = useForm<UpdatePasswordInput>({
    resolver: zodResolver(updatePasswordScheme),
  });
  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;
  const onSubmitHandler: SubmitHandler<UpdatePasswordInput> = async (
    values
  ) => {
    startTransition(async () => {
      const result = await updatePassword(values);

      if (result.error) {
        toast.error(
          "Hubo un problema al actualizar su contraseña, intentelo nuevamente."
        );
        reset({ password: "", passwordConfirm: "" });
        return;
      }
      toast.success("Su contraseña se cambió correctamente");
      await signOutLocal();
    });
  };
  return (
    <AuthForm
      title="Restablecer contraseña"
      description="Ingresa tu nueva contraseña"
      fields={[
        { name: "password", type: "password", placeholder: "Contraseña" },
        {
          name: "passwordConfirm",
          type: "password",
          placeholder: "Contraseña",
        },
      ]}
      onSubmit={handleSubmit(onSubmitHandler)}
      register={register}
      errors={errors}
      isPending={isPending}
      submitButtonText={isPending ? "Restableciendo..." : "Restablecer"}
      showOAuth={false}
      footerLinks={[]}
    />
  );
};
