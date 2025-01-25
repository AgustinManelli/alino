"use client";

import { createPortal } from "react-dom";
import { motion, PanInfo } from "motion/react";
import InstallPWAButton from "./install-pwa-button";
import styles from "./WpaDownloadModal.module.css";
import { AlinoLogo, SquircleIcon } from "@/lib/ui/icons";

interface props {
  setIsOpen: (value: boolean) => void;
}

export function Modal({ setIsOpen }: props) {
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.y > 100) {
      setIsOpen(false);
    }
  };
  const portalRoot = document.getElementById("modal-root");
  if (!portalRoot) {
    return null;
  }
  return createPortal(
    <motion.div
      key="wpa-modal-container"
      className={styles.container}
      initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
      animate={{ backgroundColor: "rgba(0, 0, 0, 0.1)" }}
      exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
    >
      <motion.div
        key="wpa-modal"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 20 }}
        drag="y"
        dragDirectionLock
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={{ top: 0, bottom: 0.2 }}
        onDragEnd={handleDragEnd}
        onClick={(e) => e.stopPropagation()}
        className={styles.modal}
      >
        <div className={styles.dragBar}></div>
        <section className={styles.iconSection}>
          <motion.div
            className={styles.skeletonIcon}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
          >
            <SquircleIcon
              style={{
                fill: "rgba(0,0,0, 0.05)",
                width: "30px",
                height: "auto",
              }}
            />
          </motion.div>
          <motion.div
            className={styles.skeletonIcon}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
            }}
          >
            <SquircleIcon
              style={{
                fill: "rgba(0,0,0, 0.05)",
                width: "50px",
                height: "auto",
              }}
            />
          </motion.div>
          <motion.div
            className={styles.alinoIcon}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.2,
            }}
          >
            <motion.div
              className={styles.glow}
              initial={{ scale: 0, rotate: 0 }}
              animate={{ scale: 1, rotate: [0, 360] }}
              transition={{
                duration: 0.5,
                rotate: {
                  duration: 5,
                  repeat: Infinity,
                  ease: "linear",
                },
                delay: 0.5,
              }}
            />
            <SquircleIcon
              style={{
                fill: "#fff",
                width: "80px",
                height: "auto",
              }}
            />
            <AlinoLogo
              style={{
                stroke: "#1c1c1c",
                strokeWidth: "1.5",
                width: "40px",
                height: "auto",
                position: "absolute",
              }}
            />
          </motion.div>
          <motion.div
            className={styles.skeletonIcon}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.4,
            }}
          >
            <SquircleIcon
              style={{
                fill: "rgba(0,0,0, 0.05)",
                width: "50px",
                height: "auto",
              }}
            />
          </motion.div>
          <motion.div
            className={styles.skeletonIcon}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.6,
            }}
          >
            <SquircleIcon
              style={{
                fill: "rgba(0,0,0, 0.05)",
                width: "30px",
                height: "auto",
              }}
            />
          </motion.div>
        </section>
        <section className={styles.textSection}>
          {/* <h2>Descargá Alino</h2> */}
          {/* <p>
            Mejora tu experiencia agregando nuestra app a tu inicio. ¡Rápida,
            práctica y siempre a mano!
          </p> */}
          <AnimatedText
            style={{ fontSize: "20px", fontWeight: "bold" }}
            text={"Descarga Alino"}
          />
          <AnimatedText
            style={{ fontSize: "16px" }}
            text={
              "Mejora tu experiencia agregando Alino a tu inicio. ¡Rápida, práctica y siempre a mano!"
            }
          />
        </section>
        <section className={styles.buttonSection}>
          <InstallPWAButton />
        </section>
      </motion.div>
    </motion.div>,
    portalRoot
  );
}

function AnimatedText({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  const words = text.split(" ");

  return (
    <motion.div
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "start",
        gap: "0.3em",
      }}
    >
      {words.map((word, i) => (
        <motion.span
          style={style}
          key={i}
          initial={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          animate={{
            filter: "blur(0px)",
            y: 0,
            opacity: 1,
            color: ["#f0f0f0", "#e6bccd", "#c9e4de", "#95b8d1", "#1c1c1c"],
            // color: ["#f2f2f2", "#e8d5f5", "#b8e9fa", "#a2d2ff", "#1c1c1c"],
          }}
          transition={{
            duration: 1,
            delay: i * 0.05, // Espaciado más sutil
            // ease: "easeInOut",
            y: {
              delay: i * 0.05,
              type: "spring",
              stiffness: 100,
            },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
