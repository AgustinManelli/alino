"use client";
import { memo, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { TextAnimation } from "@/components/ui/text-animation";
import styles from "../task-input.module.css";

const PLACEHOLDER_TEXTS = [
  "Terminar el TP de matemáticas 📐",
  "Estudiar para el parcial de mañana",
  "Leer los apuntes de la clase de hoy",
  "Empezar el trabajo práctico (aunque sea un poco) 🧠",
  "Practicar ejercicios antes del parcial",
  "Pasar en limpio los apuntes 🧾",
  "Revisar lo que no entendí en clase",
  "Organizar lo que tengo que entregar esta semana",
  "Buscar material para el trabajo",
  "Dividir el TP en partes más chicas",
  "Repasar lo de la clase pasada",
  "Hacer ejercicios de la guía 📘",
  "Preparar la exposición 🎤",
  "Armar un resumen para estudiar",
  "Ver fechas de exámenes",
  "Responder el mail del profesor",
  "Corregir el TP antes de entregarlo ✔️",
  "Ponerse al día con esta materia",
  "Anotar dudas para la próxima clase ❓",
];

const PLACEHOLDER_TRANSITION = {
  type: "spring",
  stiffness: 400,
  damping: 28,
  mass: 0.6,
  opacity: { duration: 0.18 },
  filter: { duration: 0.2 },
} as const;

interface PlaceholderTextProps {
  focus: boolean;
}

export const PlaceholderText = memo(function PlaceholderText({
  focus,
}: PlaceholderTextProps) {
  const [currentText, setCurrentText] = useState(
    () =>
      PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)],
  );

  useEffect(() => {
    if (focus) return;
    setCurrentText(
      PLACEHOLDER_TEXTS[Math.floor(Math.random() * PLACEHOLDER_TEXTS.length)],
    );
    const interval = setInterval(() => {
      setCurrentText((prev) => {
        const idx = PLACEHOLDER_TEXTS.indexOf(prev);
        return PLACEHOLDER_TEXTS[(idx + 1) % PLACEHOLDER_TEXTS.length];
      });
    }, 6000);
    return () => clearInterval(interval);
  }, [focus]);

  return (
    <AnimatePresence>
      {!focus && (
        <motion.div
          className={styles.placeholder}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={PLACEHOLDER_TRANSITION}
        >
          <TextAnimation
            style={{
              fontSize: "14px",
              height: "17px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
            text={currentText}
            textColor="var(--placeholder-text-color)"
            opacity={0.3}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
