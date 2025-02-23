"use client";

import { useEffect, useRef, useState } from "react";

import { useLoaderStore } from "@/store/useLoaderStore";

import { LoadingIcon } from "@/components/ui/icons/icons";
import styles from "./loader.module.css";

export function Loader() {
  const { isLoading } = useLoaderStore();
  const [mounted, setMounted] = useState(false);
  const initialized = useRef(false);

  const texts = [
    "Alino viene de la unión de las palabras All in One.",
    "Alino te permite organizar tus tareas de manera eficiente.",
    "Con Alino puedes gestionar múltiples listas de tareas a la vez.",
    "Alino es una aplicación ligera y fácil de usar.",
    "Alino te ayuda a mantenerte enfocado en lo que realmente importa.",
    "Pronto podrás integrar calendarios y recordatorios en Alino.",
    "La interfaz de Alino está diseñada para ser intuitiva y rápida.",
    "Alino es completamente gratis, aprovecha sus funcionalidades al máximo.",
    "Organiza tu vida con Alino y alcanza tus metas más rápido.",
    "Alino se encuentra en constante desarrollo, ¡espera nuevas funciones pronto!.",
    "Tu feedback es importante, ayúdanos a mejorar Alino.",
    "Alino soporta múltiples dispositivos.",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!initialized.current) {
      setCurrentIndex(Math.floor(Math.random() * texts.length));
      initialized.current = true;
      setMounted(true);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [mounted]);

  if (!mounted || !isLoading) return null;

  return (
    <div className={styles.overlay}>
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
        <p className={styles.text}>{texts[currentIndex]}</p>
      </section>
    </div>
  );
}
