"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetUserSchema, ResetUserInput } from "@/lib/schemas/user-schema";
import { resetPassword } from "@/lib/auth/actions";

import { AuthForm } from "../../components/auth-form";

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const methods = useForm<ResetUserInput>({
    resolver: zodResolver(resetUserSchema),
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmitHandler: SubmitHandler<ResetUserInput> = async (values) => {
    startTransition(async () => {
      const href = window.location.origin;
      const result = await resetPassword(values, href);

      if (result.error) {
        toast.error(
          "Hubo un error al recuperar su contraseña, intenelo nuevamente,"
        );
      }

      reset({ email: "" });

      toast.success(
        "Si su cuenta le pertenece, verifique su casilla de correo para recuperar su contraseña"
      );

      router.push("/sign-in");
    });
  };

  return (
    <AuthForm
      title="Recupera tu cuenta"
      description="Introduce tu correo electrónico para recuperar tu cuenta"
      fields={[{ name: "email", type: "email", placeholder: "Email" }]}
      onSubmit={handleSubmit(onSubmitHandler)}
      register={register}
      errors={errors}
      isPending={isPending}
      submitButtonText={isPending ? "Recuperando..." : "Recuperar cuenta"}
      showOAuth={false}
      footerLinks={[
        { text: "¿Recuerdas tu contraseña? inicia sesión", href: "/sign-in" },
      ]}
    />
  );
}
