"use client";

import { LoginUserInput, loginUserSchema } from "@/lib/user-schema";
import styles from "../login.module.css";
import { signInWithEmailAndPassword } from "../actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { redirect, useRouter } from "next/navigation";
import { GithubIcon, LoadingIcon } from "@/lib/ui/icons";
import { createClient } from "@/utils/supabase/client";

interface Props {
  formType: string;
  handleSetFormType: (type: string) => void;
}

export const LoginForm: React.FC<Props> = ({ formType, handleSetFormType }) => {
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
      const typeError = JSON.parse(result)[0];
      const error = JSON.parse(result)[1];

      if (error) {
        setError(typeError);
        if (typeError === "Invalid login credentials") {
          toast.error("Email o contraseña incorrecta.");
        } else {
          toast.error(typeError);
        }
        reset({ password: "" });
        return;
      }
      toast.success("Sesión iniciada correctamente");
      setError("");
      router.push("/alino-app");
    });
  };

  const handleSignIn = async () => {
    const supabase = await createClient();
    const href = window.location.origin;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${href}/auth/callback`,
      },
    });
    if (error) {
      toast.error("error");
      return;
    }
    toast.success("good");
  };
  return (
    <section className={styles.form}>
      <div>
        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.paraph}>Inicia sesión si tienes una cuenta.</p>
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
          <input
            id="password"
            type="password"
            placeholder="password"
            className={styles.input}
            {...register("password")}
            required
          />
        </div>
        <button className={styles.buttom} type="submit" disabled={isPending}>
          {isPending ? (
            <LoadingIcon
              style={{
                width: "20px",
                height: "auto",
                stroke: "#fff",
                strokeWidth: "3",
              }}
            />
          ) : (
            ""
          )}
          <p>{isPending ? "Iniciando sesión..." : "Iniciar sesión"}</p>
        </button>
      </form>
      <button onClick={handleSignIn}>
        <GithubIcon style={{ width: "25px" }} />
        <p>sign in with github</p>
      </button>
      <div className={styles.moreInfo}>
        <button
          className={styles.textButton}
          onClick={() => {
            handleSetFormType("signup");
          }}
        >
          ¿No tienes una cuenta?
        </button>
        <button
          className={styles.textButton}
          onClick={() => {
            handleSetFormType("recover");
          }}
        >
          ¿No recuerdas tu contraseña?
        </button>
      </div>
    </section>
  );
};
