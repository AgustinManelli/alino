"use client";

import { resetUserSchema, ResetUserInput } from "../../lib/user-schema";
import styles from "../sign-in/login.module.css";
import { resetPassword } from "../../lib/auth/actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";

export const ForgotPasswordForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
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

      const { error } = JSON.parse(result);

      if (error) {
        setError(error.message);
        toast.error("Email o contraseña incorrecta");
        return;
      }
      setError("");
      toast.success(
        "Verifique su casilla de correo para recuperar su contraseña"
      );
      router.push("/sign-in");
    });
  };
  return (
    <>
      <div>
        <h2 className={styles.title}>Recupera tu cuenta</h2>
        <p className={styles.paraph}>
          Introduce tu correo electrónico para recuperar tu cuenta.
        </p>
      </div>
      <form className={styles.inputs} onSubmit={handleSubmit(onSubmitHandler)}>
        <div className={styles.inputContainer}>
          {error && <p className={styles.errorMsg}>{error}</p>}
          <input
            id="email"
            type="email"
            placeholder="email"
            className={styles.input}
            {...register("email")}
            required
          />
        </div>
        <button className={styles.buttom} type="submit" disabled={isPending}>
          Recuperar
        </button>
      </form>
      <div className={styles.moreInfo}>
        <Link className={styles.textButton} href="/sign-in">
          ¿Te acuerdas tu contraseña? inicia sesión
        </Link>
      </div>
    </>
  );
};