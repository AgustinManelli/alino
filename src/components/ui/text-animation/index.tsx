"use client";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

export function TextAnimation({
  text,
  style,
  textColor,
}: {
  text: string;
  style?: React.CSSProperties;
  textColor?: string;
}) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const words = text.split(" ");

  return (
    <motion.div
      key={text}
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "start",
        alignItems: "center",
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
          }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 1,
            delay: i * 0.05,
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
