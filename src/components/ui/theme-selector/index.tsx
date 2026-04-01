"use client";

import useThemeStore from "@/store/useThemeStore";
import { motion } from "motion/react";

import styles from "./ThemeSelector.module.css";
import { SunIcon, MoonIcon, ComputerIcon } from "../theme-dropdown/ThemeIcons";

export function ThemeSelector() {
  const { theme, setDarkTheme, setLightTheme, setSystemTheme } =
    useThemeStore();

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
          setLightTheme();
        }}
      >
        <SunIcon isLight={isLight} className={styles.ThemeIcon} />
      </button>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDarkTheme();
        }}
      >
        <MoonIcon isDark={isDark} className={styles.ThemeIcon} />
      </button>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setSystemTheme();
        }}
      >
        <ComputerIcon className={styles.ThemeIcon} />
      </button>
    </section>
  );
}
