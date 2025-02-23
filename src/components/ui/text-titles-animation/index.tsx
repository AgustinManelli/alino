"use client";

import { useEffect, useState } from "react";
import { motion, Variants, AnimatePresence } from "framer-motion";
import GraphemeSplitter from "grapheme-splitter";

import styles from "./TextTitlesAnimation.module.css";

interface AnimatedTextProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  color?: string;
  charSize?: string;
  colorEffect?: string;
}

export const TextTitlesAnimation = ({
  text,
  className = "",
  delay = 0,
  duration = 0.05,
  stagger = 0.03,
  color = "#1c1c1c",
  charSize = "14px",
  colorEffect = "#1c1c1c",
}: AnimatedTextProps) => {
  const [characters, setCharacters] = useState<string[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const splitter = new GraphemeSplitter();

  useEffect(() => {
    const normalizedText = text.replace(/\s+/g, " ");
    setCharacters(splitter.splitGraphemes(normalizedText));
    const timer = setTimeout(() => setIsVisible(true), delay * 1000);
    return () => clearTimeout(timer);
  }, [text, delay]);

  return (
    <AnimatePresence>
      {isVisible && (
        <span className={`${styles.wrapper} ${className}`}>
          {characters.map((char, index) => (
            <motion.p
              key={`${char}-${index}`}
              className={styles.character}
              initial={{
                opacity: 0,
                scale: 0,
                filter: "blur(10px)",
                color: "transparent",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                filter: "blur(0px)",
                color: [colorEffect, color],
              }}
              transition={{
                default: {
                  duration: duration,
                  delay: delay + index * stagger,
                  ease: [0.2, 0.65, 0.3, 0.9],
                },
                color: {
                  delay: delay + index * stagger + duration,
                },
              }}
              style={{ fontSize: charSize }}
              layout
            >
              {char}
            </motion.p>
          ))}
        </span>
      )}
    </AnimatePresence>
  );
};
