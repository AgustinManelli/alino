"use client";

import { LoadingIcon } from "@/lib/ui/icons";
import { useLoaderStore } from "@/store/useLoaderStore";
import { useEffect, useState } from "react";
import styles from "./loader.module.css";

export default function Loader() {
  const loading = useLoaderStore((state) => state.loading);

  const texts = [
    "Alino viene de la unión de las palabras All in One",
    "Alino te permite organizar tus tareas de manera eficiente",
    "Con Alino puedes gestionar múltiples listas de tareas a la vez",
    "Alino es una aplicación ligera y fácil de usar",
    "Alino te ayuda a mantenerte enfocado en lo que realmente importa",
    "Pronto podrás integrar calendarios y recordatorios en Alino",
    "La interfaz de Alino está diseñada para ser intuitiva y rápida",
    "Alino es completamente gratis, aprovecha sus funcionalidades al máximo",
    "Organiza tu vida con Alino y alcanza tus metas más rápido",
    "Alino se encuentra en constante desarrollo, ¡espera nuevas funciones pronto!",
    "Tu feedback es importante, ayúdanos a mejorar Alino",
    "Alino soporta múltiples dispositivos",
  ];
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * texts.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % texts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [texts.length]);

  if (!loading) return null;

  return (
    <div className={styles.overlay}>
      <div>
        <LoadingIcon
          style={{
            width: "20px",
            height: "auto",
            stroke: "#1c1c1c",
            strokeWidth: "3",
          }}
        />
      </div>
      <div className={styles.tooltip}>
        <div className={styles.tooltipHeader}>¿Sabías que ...</div>
        <p className={styles.text}>{texts[currentIndex]}</p>
      </div>
    </div>
  );
}
