"use client";

import { CreateUserInput, createUserSchema } from "../../lib/user-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { signUpWithEmailAndPassword } from "@/lib/auth/actions";
import { toast } from "sonner";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "../sign-in/login.module.css";
import Link from "next/link";

export const RegisterForm = () => {
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
    startTransition(async () => {
      const result = await signUpWithEmailAndPassword({
        dataInput: values,
        emailRedirectTo: `${location.origin}/auth/callback`,
      });
      const typeError = JSON.parse(result)[0];
      const error = JSON.parse(result)[1];
      if (error) {
        toast.error(typeError);
        reset({ password: "", passwordConfirm: "" });
        return;
      }

      toast.success(
        "Registrado correctamente, verifique su correo para verificar su cuenta"
      );
      router.push("/sign-in");
    });
  };

  return (
    <>
      <div>
        <h2 className={styles.title}>Registrarte</h2>
        <p className={styles.paraph}>Crea una cuenta alino, es 100% gratis.</p>
      </div>
      <form className={styles.inputs} onSubmit={handleSubmit(onSubmitHandler)}>
        <div className={styles.inputContainer}>
          {errors["email"] && (
            <p className={styles.errorMsg}>
              {errors["email"]?.message as string}
            </p>
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
        <div className={styles.inputContainer}>
          {errors["password"] && (
            <p className={styles.errorMsg}>
              {errors["password"]?.message as string}
            </p>
          )}
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
        {/*//formAction={login}*/}
        <button className={styles.buttom} type="submit" disabled={isPending}>
          Crear cuenta
        </button>
      </form>
      <div className={styles.moreInfo}>
        <Link className={styles.textButton} href="/sign-in">
          ¿Ya tienes una cuenta?
        </Link>
      </div>
    </>
  );
};
