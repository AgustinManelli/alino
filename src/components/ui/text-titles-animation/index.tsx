"use client";

import React, { useMemo } from "react";
import { motion } from "motion/react";

import GraphemeSplitter from "grapheme-splitter";

import type { Variants } from "motion/react";
import styles from "./TextTitlesAnimation.module.css";

interface props {
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
}: props) {
  const characters = useMemo(() => {
    const splitter = new GraphemeSplitter();
    const normalizedText = text.replace(/\s+/g, " ");
    return splitter.splitGraphemes(normalizedText);
  }, [text]);

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        delayChildren: delay * 1.5,
        staggerChildren: stagger,
      },
    },
  };

  const charVariants: Variants = {
    hidden: {
      opacity: 0,
      // scale: 0,
      // filter: "blur(10px)",
      color: "transparent",
    },
    visible: {
      opacity: 1,
      // scale: 1,
      // filter: "blur(0px)",
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
  };

  return (
    <motion.span
      className={`${styles.wrapper} ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ fontSize: charSize, fontWeight }}
    >
      {characters.slice(0, limitLenght).map((char, index) => (
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
