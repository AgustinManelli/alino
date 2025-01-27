"use client";

import { useTransition } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { resetUserSchema, ResetUserInput } from "@/lib/schemas/user-schema";
import { resetPassword } from "@/lib/auth/actions";

import styles from "../sign-in/login.module.css";

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

      const { error } = JSON.parse(result);

      if (error) {
        toast.error("Email o contraseña incorrecta");
        return;
      }
      toast.success(
        "Verifique su casilla de correo para recuperar su contraseña"
      );
      router.push("/sign-in");
    });
  };

  return (
    <motion.div
      transition={{ duration: 1 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={styles.form}
    >
      <div>
        <h2 className={styles.title}>Recupera tu cuenta</h2>
        <p className={styles.paraph}>
          Introduce tu correo electrónico para recuperar tu cuenta.
        </p>
      </div>
      <form className={styles.inputs} onSubmit={handleSubmit(onSubmitHandler)}>
        <div className={styles.inputContainer}>
          {errors["email"] && (
            <motion.p
              className={styles.errorMsg}
              transition={{ duration: 0.2 }}
              initial={{ opacity: 0, height: "0px" }}
              animate={{ opacity: 1, height: "initial" }}
              exit={{ opacity: 0, height: "0px" }}
            >
              {errors["email"]?.message as string}
            </motion.p>
          )}
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
    </motion.div>
  );
}
