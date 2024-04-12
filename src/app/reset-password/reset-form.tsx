"use client";

import {
  UpdatePasswordInput,
  updatePasswordScheme,
} from "../../lib/user-schema";
import styles from "../login/login.module.css";
import { updatePassword, signout } from "../login/actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const router = useRouter();
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

      const { error } = JSON.parse(result);

      if (error) {
        setError(error.message);
        toast.error("No se pudo actualizar su contraseña");
        reset({ password: "", passwordConfirm: "" });
        return;
      }
      setError("");
      toast.success("Su contraseña se cambio correctamente");
      await signout();
    });
  };
  return (
    <section className={styles.form}>
      <div>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.paraph}>Inicia sesión si tienes una cuenta.</p>
      </div>
      <form className={styles.inputs} onSubmit={handleSubmit(onSubmitHandler)}>
        <div className={styles.inputContainer}>
          <input
            id="password"
            type="password"
            placeholder="password"
            className={styles.input}
            {...register("password")}
            required
          />
        </div>
        <div className={styles.inputContainer}>
          {errors["passwordConfirm"] && (
            <p className={styles.errorMsg}>
              {errors["passwordConfirm"]?.message as string}
            </p>
          )}
          <input
            id="password"
            type="password"
            placeholder="Confirm Password"
            className={styles.input}
            {...register("passwordConfirm")}
            required
          />
        </div>
        <button className={styles.buttom} type="submit" disabled={isPending}>
          Cambiar contraseña
        </button>
      </form>
    </section>
  );
};
