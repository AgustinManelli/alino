"use client";

import { useEffect, useTransition } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useLoaderStore } from "@/store/useLoaderStore";
import { LoginUserInput, loginUserSchema } from "@/lib/schemas/user-schema";
import { signInWithEmailAndPassword } from "@/lib/auth/actions";

import { OauthButton } from "./components/oauthButton";

import {
  AppleIcon,
  GithubIcon,
  GoogleIcon,
  LoadingIcon,
} from "@/components/ui/icons/icons";
import styles from "./login.module.css";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const methods = useForm<LoginUserInput>({
    resolver: zodResolver(loginUserSchema),
  });

  const { setLoading } = useLoaderStore();

  useEffect(() => {
    setLoading(false);
  }, []);

  const {
    reset,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const onSubmitHandler: SubmitHandler<LoginUserInput> = async (values) => {
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
        <h2 className={styles.title}>Iniciar sesión</h2>
        <p className={styles.paraph}>Accede a tu cuenta alino.</p>
      </div>
      <form className={styles.inputs} onSubmit={handleSubmit(onSubmitHandler)}>
        <section className={styles.inputContainer}>
          <div className={styles.inputDiv}>
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
              disabled={isPending}
            />
          </div>
          <div className={styles.inputDiv}>
            {errors["password"] && (
              <motion.p
                className={styles.errorMsg}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, height: "0px" }}
                animate={{ opacity: 1, height: "initial" }}
                exit={{ opacity: 0, height: "0px" }}
              >
                {errors["password"]?.message as string}
              </motion.p>
            )}

            <input
              id="password"
              type="password"
              placeholder="password"
              className={styles.input}
              {...register("password")}
              required
              disabled={isPending}
            />
          </div>
        </section>
        <section className={styles.buttonsContainer}>
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
          <section className={styles.oauthButtonContainer}>
            <OauthButton
              providerName={"Github"}
              providerType={"github"}
              style={{ backgroundColor: "#1c1c1c", color: "#fff" }}
              loadColor={"#ffffff"}
            >
              <GithubIcon style={{ width: "25px" }} />
            </OauthButton>
            <OauthButton
              providerName={"Google"}
              providerType={"google"}
              style={{ backgroundColor: "#fff", color: "#1c1c1c" }}
              loadColor={"#1c1c1c"}
            >
              <GoogleIcon style={{ width: "25px" }} />
            </OauthButton>
          </section>
        </section>
      </form>
      <div className={styles.moreInfo}>
        <Link className={styles.textButton} href="/sign-up">
          ¿No tienes una cuenta?
        </Link>
        <Link className={styles.textButton} href="/forgot-password">
          ¿No recuerdas tu contraseña?
        </Link>
      </div>
    </motion.div>
  );
}
