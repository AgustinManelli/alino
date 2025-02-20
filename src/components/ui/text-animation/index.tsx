"use client";
import { motion } from "motion/react";

import styles from "./TextAnimation.module.css";

export function TextAnimation({
  text,
  style,
  textColor,
}: {
  text: string;
  style?: React.CSSProperties;
  textColor?: string;
}) {
  const words = text.split(" ");

  return (
    <motion.div
      key={text}
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
            color: [
              "#f0f0f0",
              "#e6bccd",
              "#c9e4de",
              "#95b8d1",
              `${textColor ? textColor : "#1c1c1c"}`,
            ],
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
