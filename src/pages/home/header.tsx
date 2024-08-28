"use client";

import { ButtonComp } from "@/components";
import styles from "./header.module.css";
import imgHero from "../../../public/headerAlino3DOpt.webp";
import { useLoaderStore } from "@/store/useLoaderStore";
import { useEffect } from "react";

export default function Header() {
  const setLoading = useLoaderStore((state) => state.setLoading);
  useEffect(() => {
    document.body.style.overflow = "";
    setLoading(false);
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.hero}>
        <section className={styles.heroContainer}>
          <div className={styles.ctaContainer}>
            <h1 className={styles.h1Text}>Tu organizador en linea</h1>
            <p className={styles.paraph}>
              Organizá tus clases, tareas o trabajos en un mismo lugar. <br />
              Es <span className={styles.paraphSpan}>100% gratis.</span>
            </p>
            <ButtonComp
              text="Pruebalo ya mismo"
              background="#1c1c1c"
              hover="rgb(230, 230, 230)"
              letterColor="#fff"
              to="sign-in"
              strokeBorder={true}
              withLoader={true}
            />
          </div>
          <img
            src={imgHero.src}
            className={styles.img}
            alt="alino logo"
            loading="lazy"
          />
        </section>
      </header>
    </div>
  );
}
