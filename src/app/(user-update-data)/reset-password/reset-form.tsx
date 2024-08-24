"use client";

import { UpdatePasswordInput, updatePasswordScheme } from "@/lib/user-schema";
import styles from "../../(auth)/sign-in/login.module.css";
import { updatePassword, signout } from "@/lib/auth/actions";
import { toast } from "sonner";
import { SubmitHandler, useForm } from "react-hook-form";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { LoadingIcon } from "@/lib/ui/icons";

export const ResetForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
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
      toast.success("Su contraseña se cambió correctamente");
      await signout();
    });
  };
  return (
    <AnimatePresence>
      <motion.div
        transition={{ duration: 1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={styles.form}
      >
        <div>
          <h2 className={styles.title}>Cambiar contraseña</h2>
          <p className={styles.paraph}>Ingresa tu nueva contraseña.</p>
        </div>
        <form
          className={styles.inputs}
          onSubmit={handleSubmit(onSubmitHandler)}
        >
          <div className={styles.inputContainer}>
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
            <div className={styles.inputDiv}>
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
              <input
                id="password"
                type="password"
                placeholder="Confirm Password"
                className={styles.input}
                {...register("passwordConfirm")}
                required
                disabled={isPending}
              />
            </div>
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
            <p>
              {isPending ? "Cambiando contraseña..." : "Cambiar contraseña"}
            </p>
          </button>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};
