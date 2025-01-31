"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";

import { CreateUserInput, createUserSchema } from "@/lib/schemas/user-schema";
import { signUpWithEmailAndPassword } from "@/lib/auth/actions";

import { AuthForm } from "../components/auth-form";

export function SignUpForm() {
  const [isPending, startTransition] = useTransition();

  const router = useRouter();

  const methods = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmitHandler: SubmitHandler<CreateUserInput> = (values) => {
    console.error("fuiste");
    startTransition(async () => {
      const result = await signUpWithEmailAndPassword({
        dataInput: values,
        emailRedirectTo: `${location.origin}/auth/callback`,
      });

      if (result.error) {
        toast.error(result.error);
        reset({ password: "", passwordConfirm: "" });
        return;
      }

      toast.success(
        "Registrado correctamente, revise su correo para verificar su cuenta"
      );

      router.push("/sign-in");
    });
  };

  return (
    <AuthForm
      title="Registrate"
      description="Crea una cuenta alino, es 100% gratis."
      fields={[
        { name: "email", type: "email", placeholder: "Email" },
        { name: "password", type: "password", placeholder: "Contraseña" },
        {
          name: "passwordConfirm",
          type: "password",
          placeholder: "Confirmar contraseña",
        },
      ]}
      onSubmit={handleSubmit(onSubmitHandler)}
      register={register}
      errors={errors}
      isPending={isPending}
      submitButtonText={isPending ? "Creando cuenta..." : "Crear cuenta"}
      showOAuth={false}
      footerLinks={[{ text: "¿Ya tienes una cuenta?", href: "/sign-in" }]}
    />
  );
}
