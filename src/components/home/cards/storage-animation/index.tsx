"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { Cloud } from "@/lib/ui/icons";
import styles from "./StorageAnimation.module.css";

export function StorageAnimation() {
  const [users, setUsers] = useState<users[]>(initialUsers);
  const [containerRad, setContainerRad] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateRadius = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setContainerRad(width / 2 - 2);
      }
    };

    const interval = setInterval(() => {
      setUsers((prevUsers) =>
        prevUsers.map((user) => ({
          color: user.color === "#eaeaea" ? user.originalColor : "#eaeaea",
          originalColor: user.originalColor,
        }))
      );
    }, 10000);

    updateRadius();
    window.addEventListener("resize", updateRadius);

    return () => {
      window.removeEventListener("resize", updateRadius);
      clearInterval(interval);
    };
  }, []);

  const position = (index: number) => {
    const angle = (2 * Math.PI * index) / users.length;
    const x =
      containerRad + containerRad * Math.cos(angle) - containerRad * 0.2;
    const y =
      containerRad + containerRad * Math.sin(angle) - containerRad * 0.2;
    return { x, y };
  };

  return (
    <section className={styles.container}>
      <div className={styles.orbit} ref={containerRef}>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: [0, 360] }}
          transition={{
            rotate: {
              duration: 60,
              repeat: Infinity,
              ease: "linear",
            },
          }}
          className={styles.floatingContainer}
        >
          {users.map((user, index) => {
            const { x, y } = position(index);
            return (
              <User
                key={index}
                color={user.color}
                left={`${x}px`}
                top={`${y}px`}
                delay={index}
              />
            );
          })}
        </motion.div>
        <motion.div
          className={styles.glow}
          initial={{ scale: 1, rotate: 0 }}
          animate={{ scale: [1, 1.05, 0.95, 1], rotate: [0, 360] }}
          transition={{
            duration: 0.5,
            rotate: {
              duration: 5,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
        <Cloud
          style={{
            width: "40%",
            height: "auto",
            fill: "#fff",
            position: "absolute",
          }}
        />
      </div>
    </section>
  );
}

function User({
  color,
  left,
  top,
  delay,
}: {
  color?: string;
  left: string;
  top: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0, rotate: 0, left: "50%", top: "50%" }}
      animate={{
        opacity: 1,
        scale: color === "#eaeaea" ? 0.6 : 1,
        backgroundColor: `${color}`,
        rotate: [0, -360],
        left,
        top,
      }}
      exit={{ opacity: 0, scale: 0, rotate: 0 }}
      transition={{
        duration: 0.5,
        ease: "easeInOut",
        rotate: {
          duration: 60,
          repeat: Infinity,
          ease: "linear",
        },
        delay: delay / 20,
      }}
      className={styles.userContainer}
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: color === "#eaeaea" ? 0 : 1 }}
        transition={{
          delay: delay / 20,
        }}
        className={styles.userDot}
      />
      <div className={styles.userBorder}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 79.07 76.28"
          style={{
            width: "100%",
            height: "auto",
            stroke: "#fff",
            fill: "none",
            strokeWidth: "5",
          }}
        >
          <path d="M77.07,74.28c-22.97-22.35-52.11-22.35-75.07,0" />
          <path d="M61.46,24.45c0,12.4-10.05,22.45-22.45,22.45-12.4,0-22.45-10.05-22.45-22.45,0-12.4,10.05-22.45,22.45-22.45s22.45,10.05,22.45,22.45Z" />
        </svg>
      </div>
    </motion.div>
  );
}

const initialUsers = [
  { color: "#eaeaea", originalColor: "#f8a3c5" },
  { color: "#83e1b7", originalColor: "#83e1b7" },
  { color: "#eaeaea", originalColor: "#ffd79a" },
  { color: "#cba4f5", originalColor: "#cba4f5" },
  { color: "#eaeaea", originalColor: "#85c6f7" },
  { color: "#7ac7f0", originalColor: "#7ac7f0" },
];

type users = {
  color: string;
  originalColor: string;
};
