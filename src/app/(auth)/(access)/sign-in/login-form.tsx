"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { LoginUserInput, loginUserSchema } from "@/lib/schemas/user-schema";
import { signInWithEmailAndPassword } from "@/lib/auth/actions";

import { AuthForm } from "../../components/auth-form";
import { useNavigationLoader } from "@/hooks/useNavigationLoader";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const { setLoading } = useNavigationLoader();
  const router = useRouter();

  const methods = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
  });

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmitHandler: SubmitHandler<LoginUserInput> = (values) => {
    startTransition(async () => {
      const result = await signInWithEmailAndPassword(values);

      if (result.error) {
        toast.error(
          "Email o contraseña incorrecta, verifica tus datos e intentalo nuevamente."
        );
        reset({ password: "" });
        return;
      }

      if (result.data) {
        const user = result.data.user;
        const message =
          user.user_metadata.name === undefined
            ? "Hola, bienvenido nuevamente a Alino"
            : `Hola ${user.user_metadata.name}, bienvenido nuevamente a Alino`;

        toast.success(message);
      }
      router.push("/alino-app");
      setLoading(true);
    });
  };

  return (
    <AuthForm
      title="Iniciar sesión"
      description="Accede a tu cuenta alino."
      fields={[
        { name: "email", type: "email", placeholder: "Email" },
        { name: "password", type: "password", placeholder: "Contraseña" },
      ]}
      onSubmit={handleSubmit(onSubmitHandler)}
      register={register}
      errors={errors}
      isPending={isPending}
      submitButtonText={isPending ? "Iniciando sesión..." : "Iniciar sesión"}
      showOAuth={true}
      footerLinks={[
        { text: "¿No tienes una cuenta?", href: "/sign-up" },
        { text: "¿No recuerdas tu contraseña?", href: "/forgot-password" },
      ]}
    />
  );
}
