"use client";

import { LoginUserInput, loginUserSchema } from "../lib/user-schema";
import styles from "./login.module.css";
import { AlinoLogo, ArrowLeft } from "../../components/icons";
import Link from "next/link";
import { signInWithEmailAndPassword } from "./actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

export default function Login() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
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
  const onSubmitHandler: SubmitHandler<LoginUserInput> = async (values) => {
    startTransition(async () => {
      const result = await signInWithEmailAndPassword(values);

      const { error } = JSON.parse(result);
      if (error) {
        setError(error.message);
        toast.error("Email o contraseña incorrecta");
        reset({ password: "" });
        return;
      }
      setError("");
      toast.success("successfully logged in");
      router.push("/alino-app");
    });
  };

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Link href="/">
          <div className={styles.backButton}>
            <ArrowLeft />
          </div>
        </Link>
        <AlinoLogo height="50px" />
        <section className={styles.form}>
          <div>
            <h2 className={styles.title}>Iniciar sesión</h2>
            <p className={styles.paraph}>Inicia sesión si tienes una cuenta.</p>
          </div>
          <form
            className={styles.inputs}
            onSubmit={handleSubmit(onSubmitHandler)}
          >
            <div className={styles.inputContainer}>
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
              <input
                id="password"
                type="password"
                placeholder="password"
                className={styles.input}
                {...register("password")}
                required
              />
            </div>
            {/*//formAction={login}*/}
            <button
              className={styles.buttom}
              type="submit"
              disabled={isPending}
            >
              Iniciar sesion
            </button>
          </form>
          <div className={styles.moreInfo}>
            <button className={styles.textButton}>
              ¿No tienes una cuenta?
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
