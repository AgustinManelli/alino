"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useLoaderStore } from "@/store/useLoaderStore";
import { LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./loader.module.css";

const LOADER_TEXTS = [
  "Alino viene de la unión de las palabras All in One.",
  "Alino te permite organizar tus tareas de manera eficiente.",
  "Con Alino puedes gestionar múltiples listas de tareas a la vez.",
  "Alino es una aplicación ligera y fácil de usar.",
  "Alino te ayuda a mantenerte enfocado en lo que realmente importa.",
  "Pronto podrás integrar calendarios y recordatorios en Alino.",
  "La interfaz de Alino está diseñada para ser intuitiva y rápida.",
  "Alino es completamente gratis, aprovecha sus funcionalidades al máximo.",
  "Organiza tu vida con Alino y alcanza tus metas más rápido.",
  "Alino se encuentra en constante desarrollo, ¡espera nuevas funciones pronto!",
  "Tu feedback es importante, ayúdanos a mejorar Alino.",
  "Alino soporta múltiples dispositivos.",
];

function LoaderOverlay() {
  const [textIndex, setTextIndex] = useState(() =>
    Math.floor(Math.random() * LOADER_TEXTS.length),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % LOADER_TEXTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeInOut" }}
    >
      <figure>
        <LoadingIcon
          style={{
            width: "20px",
            height: "auto",
            stroke: "#fff",
            strokeWidth: "3",
          }}
        />
      </figure>

      <section className={styles.tooltip}>
        <header className={styles.tooltipHeader}>¿Sabías que ...</header>

        <AnimatePresence mode="wait">
          <motion.p
            key={textIndex}
            className={styles.text}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {LOADER_TEXTS[textIndex]}
          </motion.p>
        </AnimatePresence>
      </section>
    </motion.div>
  );
}

export function Loader() {
  const { isLoading, setLoading } = useLoaderStore();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, [pathname, setLoading]);

  return (
    <AnimatePresence>
      {isLoading && <LoaderOverlay key="loader-overlay" />}
    </AnimatePresence>
  );
}
