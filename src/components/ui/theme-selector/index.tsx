"use client";

import { motion } from "motion/react";
import { useTheme } from "next-themes";

import { SunIcon, MoonIcon, ComputerIcon } from "../theme-dropdown/ThemeIcons";
import styles from "./ThemeSelector.module.css";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();

  const isDark = theme === "dark";
  const isLight = theme === "light";

  return (
    <section
      className={styles.container}
      style={{
        justifyContent:
          theme === "light" ? "start" : theme === "dark" ? "center" : "end",
      }}
    >
      <motion.div layout className={styles.selector}></motion.div>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme("light");
        }}
      >
        <SunIcon isLight={isLight} className={styles.ThemeIcon} />
      </button>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme("dark");
        }}
      >
        <MoonIcon isDark={isDark} className={styles.ThemeIcon} />
      </button>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setTheme("system");
        }}
      >
        <ComputerIcon className={styles.ThemeIcon} />
      </button>
    </section>
  );
}
