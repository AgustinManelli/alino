"use client";

import { motion } from "motion/react";

import { StorageAnimation } from "./storage-animation";
import Image from "next/image";
import minimalism from "../../../../../public/tile-resource.webp";
import responsivedesign from "../../../../../public/responsive-design.webp";

import styles from "./Cards.module.css";

export function Cards() {
  return (
    <section className={styles.container}>
      <div className={styles.containerLimit}>
        <article className={styles.cardsContainer}>
          <motion.div className={styles.card} initial={{ scale: 0.9 }}>
            <div className={styles.cardContent}>
              <div className={styles.infoContainer}>
                <h2>Diseño minimalista e intuitivo</h2>
                <p>
                  Alino ofrece una experiencia agradable para todos los usuarios
                </p>
              </div>
              <div className={styles.imgContainer}>
                <Image
                  src={minimalism}
                  alt="Diseño multiplataforma"
                  priority
                  className={styles.img}
                />
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.card}>
            <div className={styles.cardContent}>
              <div className={styles.infoContainer}>
                <h2>Almacenamiento en la nube</h2>
                <p>
                  Toda tu información se encuentra guardada y protegida en la
                  nube
                </p>
              </div>
              <div className={styles.imgContainer}>
                <StorageAnimation />
              </div>
            </div>
          </motion.div>

          <motion.div className={styles.card} initial={{ scale: 0.9 }}>
            <div className={styles.cardContent}>
              <div className={styles.infoContainer}>
                <h2>Diseño Multiplataforma</h2>
                <p>Diseño amigable con todo tipo de dispositivos</p>
              </div>
              <div className={styles.imgContainer}>
                <Image
                  src={responsivedesign}
                  alt="Diseño multiplataforma"
                  priority
                  className={styles.img}
                />
              </div>
            </div>
          </motion.div>
        </article>
      </div>
    </section>
  );
}
