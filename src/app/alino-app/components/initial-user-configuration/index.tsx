"use client";
import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useUserDataStore } from "@/store/useUserDataStore";

import { UsernameInput } from "./username-input";
import { WindowComponent } from "@/components/ui/window-component";
import { Skeleton } from "@/components/ui/skeleton";

import styles from "./InitialUserConfiguration.module.css";

interface Props {
  onComplete: () => void;
}

export const InitialUserConfiguration = ({ onComplete }: Props) => {
  const [finish, setFinish] = useState<boolean>(false);

  const { user, setUsernameFirstTime } = useUserDataStore(
    useShallow((state) => ({
      user: state.user,
      setUsernameFirstTime: state.setUsernameFirstTime,
    }))
  );

  const onSubmit = async (username: string) => {
    const { error } = await setUsernameFirstTime(username);
    if (error || error === "") return error;

    setFinish(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));

    onComplete();
    return null;
  };

  return (
    <motion.div
      className={styles.initialUserConfigurationContainer}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={styles.glow}
        initial={{ scale: 0, rotate: 0 }}
        animate={{
          scale: [1, 1.05, 0.95, 1],
          rotate: [0, 360],
        }}
        transition={{
          duration: 2,
          rotate: {
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          },
          scale: {
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          },
          delay: 0.5,
        }}
      >
        <Image
          src="/circle-blur.webp"
          alt="Blur circle"
          style={{
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
          priority
          fill
        />
      </motion.div>
      <AnimatePresence>
        {finish && (
          <motion.h1
            className={styles.initialText}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            Bienvenido a alino
          </motion.h1>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!finish && (
          <WindowComponent
            windowTitle={"Bienvenido a Alino"}
            closeAction={false}
            adaptative={{ height: "auto" }}
            bgBlur={false}
            id={"initial-user-configuration-popup"}
          >
            <div className={styles.container}>
              <section className={styles.textsContainer}>
                <p className={styles.subtitle}>
                  Antes de comenzar, necesitarás definir el nombre con el que el
                  mundo te conocerá 🌎. Bueno... o al menos los otros usuarios
                  de Alino.
                </p>
                <p className={styles.subtitle}>
                  Ya he pensado uno para ti, pero sé que tienes en mente uno
                  mejor, ¿O no? No te preocupes, puedes cambiarlo luego.
                </p>
              </section>
              {user?.username ? (
                <UsernameInput
                  initialValue={user?.username}
                  onSubmit={onSubmit}
                />
              ) : (
                <Skeleton
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "10px",
                  }}
                />
              )}
            </div>
          </WindowComponent>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
