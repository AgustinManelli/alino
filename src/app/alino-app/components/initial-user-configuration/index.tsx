"use client";

import { WindowComponent } from "@/components/ui/window-component";
import styles from "./InitialUserConfiguration.module.css";
import UsernameInput from "./username-input";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEffect, useRef, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";

export default function InitialUserConfiguration({
  onComplete,
}: {
  onComplete: () => void;
}) {
  const [finish, setFinish] = useState<boolean>(false);
  const [textToShow, setTextToShow] = useState("Bienvenido a alino");
  const { user, getUser, setUsernameFirstTime } = useTodoDataStore();
  const executedRef = useRef(false);

  useEffect(() => {
    if (executedRef.current) return;
    executedRef.current = true;

    const fetchUser = async () => {
      await getUser();
    };

    fetchUser();
  }, []);

  const onSubmit = async (username: string) => {
    const { error } = await setUsernameFirstTime(username);
    if (error || error === "") return error;

    setFinish(true);
    await new Promise((resolve) => setTimeout(resolve, 3000));
    // setTextToShow("Disfruta ordenando tu día");
    // await new Promise((resolve) => setTimeout(resolve, 3000));

    onComplete();
    return null;
  };

  return (
    <motion.div
      className={styles.generalContainer}
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
          alt="blur circle"
          fill
          style={{
            objectFit: "contain",
            pointerEvents: "none",
            userSelect: "none",
          }}
        />
      </motion.div>
      <AnimatePresence mode="wait">
        {finish && (
          <motion.h1
            key={textToShow}
            className={styles.initialText}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            {textToShow}
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
}
