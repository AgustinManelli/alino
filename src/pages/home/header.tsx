"use client";

import { ButtonComp } from "@/components";
import styles from "./header.module.css";
import imgHero from "../../../public/headerAlino3DOpt.webp";
import { useLoaderStore } from "@/store/useLoaderStore";
import { useEffect } from "react";
import { SquircleIcon } from "@/lib/ui/icons";
import Image from "next/image";

export default function Header() {
  const setLoading = useLoaderStore((state) => state.setLoading);

  useEffect(() => {
    document.body.style.overflow = "";
    setLoading(false);
  }, [setLoading]);

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.header}>
        <section className={styles.content}>
          <div className={styles.textContainer}>
            <div className={styles.fxContainer}>
              <SquircleIcon
                style={{
                  position: "absolute",
                  left: "0px",
                  fill: "none",
                  stroke: "rgb(240,240,240)",
                  strokeWidth: "0.2px",
                  width: "100%",
                }}
              />
              <SquircleIcon
                style={{
                  position: "absolute",
                  left: "0px",
                  fill: "none",
                  stroke: "rgb(240,240,240)",
                  strokeWidth: "0.2px",
                  width: "95%",
                }}
              />
              <SquircleIcon
                style={{
                  position: "absolute",
                  left: "0px",
                  fill: "none",
                  stroke: "rgb(240,240,240)",
                  strokeWidth: "0.2px",
                  width: "90%",
                }}
              />
              <SquircleIcon
                style={{
                  position: "absolute",
                  left: "0px",
                  fill: "none",
                  stroke: "rgb(240,240,240)",
                  strokeWidth: "0.2px",
                  width: "85%",
                }}
              />
            </div>
            <h1 className={styles.title}>Tu organizador en línea</h1>
            <p className={styles.subtitle}>
              Organizá tus clases, tareas o trabajos
              <span className={styles.highlight}> en un mismo lugar.</span>
            </p>
            <ButtonComp
              text="Pruébalo ya mismo"
              background="#1c1c1c"
              hover="rgb(230, 230, 230)"
              letterColor="#fff"
              to="sign-in"
              strokeBorder={true}
              withLoader={true}
              aria-label="Prueba Alino"
            />
          </div>
          <Image
            src={imgHero}
            alt="Alino, organizador en linea"
            className={styles.image}
            priority
            width={800}
            height={600}
          />
        </section>
      </header>
    </div>
  );
}
