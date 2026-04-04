"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";
import GraphemeSplitter from "grapheme-splitter";

import type { Variants } from "motion/react";
import styles from "./TextTitlesAnimation.module.css";

interface Props {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  stagger?: number;
  color?: string;
  charSize?: string;
  fontWeight?: string;
  colorEffect?: string;
  limitLenght?: number;
}

const splitter = new GraphemeSplitter();

export const TextTitlesAnimation = React.memo(function TextTitlesAnimation({
  text,
  className = "",
  delay = 0,
  duration = 0.05,
  stagger = 0.03,
  color = "#1c1c1c",
  charSize = "14px",
  fontWeight = "500",
  colorEffect = "#1c1c1c",
  limitLenght = 30,
}: Props) {
  const characters = useMemo(() => {
    const normalizedText = text.replace(/\s+/g, " ");
    return splitter.splitGraphemes(normalizedText).slice(0, limitLenght);
  }, [text, limitLenght]);

  const containerVariants = useMemo(
    () => ({
      hidden: {},
      visible: {
        transition: {
          delayChildren: delay * 1.5,
          staggerChildren: stagger,
        },
      },
    }),
    [delay, stagger],
  );

  const charVariants = useMemo<Variants>(
    () => ({
      hidden: {
        opacity: 0,
        color: "transparent",
      },
      visible: {
        opacity: 1,
        color: [colorEffect, color],
        transition: {
          default: {
            duration: duration,
            ease: [0.2, 0.65, 0.3, 0.9],
          },
          color: {
            duration: duration * 2,
          },
        },
      },
    }),
    [colorEffect, color, duration],
  );

  const spanStyle = useMemo(
    () => ({ fontSize: charSize, fontWeight }),
    [charSize, fontWeight],
  );

  return (
    <motion.span
      className={`${styles.wrapper} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={spanStyle}
    >
      {characters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          className={styles.character}
          variants={charVariants}
        >
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
});
