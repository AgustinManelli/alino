"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { signUpWithEmailAndPassword } from "@/lib/auth/actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateUserInput, createUserSchema } from "@/lib/user-schema";
import { AnimatePresence, motion } from "framer-motion";
import styles from "../sign-in/login.module.css";
import { LoadingIcon } from "@/lib/ui/icons";

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
        "Registrado correctamente, revise su correo para verificar su cuenta"
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
          <AnimatePresence>
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
          </AnimatePresence>
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
          <AnimatePresence>
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
          </AnimatePresence>
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
          <AnimatePresence>
            {errors["passwordConfirm"] && (
              <motion.p
                className={styles.errorMsg}
                transition={{ duration: 0.2 }}
                initial={{ opacity: 0, height: "0px" }}
                animate={{ opacity: 1, height: "initial" }}
                exit={{ opacity: 0, height: "0px" }}
              >
                {errors["passwordConfirm"]?.message as string}
              </motion.p>
            )}
          </AnimatePresence>
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
          <p>{isPending ? "Creando cuenta..." : "Crear cuenta"}</p>
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
