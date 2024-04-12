"use client";

import { resetUserSchema, ResetUserInput } from "../../../lib/user-schema";
import styles from "../login.module.css";
import { resetPassword, signInWithEmailAndPassword } from "../actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

interface Props {
  formType: string;
  handleSetFormType: (type: string) => void;
}

export const ResetForm: React.FC<Props> = ({ formType, handleSetFormType }) => {
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
      toast.success("successfully logged in");
      router.push("/login");
    });
  };
  return (
    <section className={styles.form}>
      <div>
        <h2 className={styles.title}>Cambiar contraseña</h2>
        <p className={styles.paraph}>
          Si no recuerdas tu contraseña puedes cambiarla.
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
        <button
          className={styles.textButton}
          onClick={() => {
            handleSetFormType("login");
          }}
        >
          Iniciar sesión
        </button>
      </div>
    </section>
  );
};
