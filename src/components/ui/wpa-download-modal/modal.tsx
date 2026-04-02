"use client";

import { motion } from "motion/react";
import { Drawer } from "vaul";

import InstallPWAButton from "./install-pwa-button";

import { AlinoLogo, SquircleIcon } from "@/components/ui/icons/icons";
import styles from "./WpaDownloadModal.module.css";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PwaDrawer({ open, onOpenChange }: Props) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className={styles.overlay} />
        <Drawer.Content className={styles.content}>
          <Drawer.Handle className={styles.handle} />

          <section className={styles.iconSection}>
            <SkeletonIcon size={30} delay={0.6} />
            <SkeletonIcon size={50} delay={0.4} />

            <motion.div
              className={styles.alinoIcon}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <motion.div
                className={styles.glow}
                initial={{ scale: 0, rotate: 0 }}
                animate={{ scale: [1, 1.05, 0.95, 1], rotate: [0, 360] }}
                transition={{
                  rotate: { duration: 5, repeat: Infinity, ease: "linear" },
                  scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
                  delay: 0.5,
                }}
              />
              <SquircleIcon
                style={{ fill: "#fff", width: "80px", height: "auto" }}
              />
              <AlinoLogo
                style={{
                  fill: "#1c1c1c",
                  width: "40px",
                  height: "auto",
                  position: "absolute",
                }}
              />
            </motion.div>

            <SkeletonIcon size={50} delay={0.4} />
            <SkeletonIcon size={30} delay={0.6} />
          </section>

          <section className={styles.textSection}>
            <AnimatedText
              text="Descarga Alino"
              style={{ fontSize: "20px", fontWeight: "bold" }}
            />
            <AnimatedText
              text="Mejora tu experiencia agregando Alino a tu inicio. ¡Rápida, práctica y siempre a mano!"
              style={{ fontSize: "16px" }}
            />
          </section>

          <section className={styles.buttonSection}>
            <InstallPWAButton onClose={() => onOpenChange(false)} />
          </section>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

function SkeletonIcon({ size, delay }: { size: number; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
    >
      <SquircleIcon
        style={{ fill: "rgba(0,0,0,0.05)", width: `${size}px`, height: "auto" }}
      />
    </motion.div>
  );
}

function AnimatedText({
  text,
  style,
}: {
  text: string;
  style?: React.CSSProperties;
}) {
  return (
    <motion.div style={{ display: "flex", flexWrap: "wrap", gap: "0.3em" }}>
      {text.split(" ").map((word, i) => (
        <motion.span
          key={i}
          style={style}
          initial={{ opacity: 0, y: -10, filter: "blur(3px)" }}
          animate={{
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            color: ["#f0f0f0", "#e6bccd", "#c9e4de", "#95b8d1", "#1c1c1c"],
          }}
          transition={{
            duration: 1,
            delay: i * 0.05,
            y: { delay: i * 0.05, type: "spring", stiffness: 100 },
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
}
