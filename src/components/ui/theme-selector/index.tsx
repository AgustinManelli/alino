"use client";
import useThemeStore from "@/store/useThemeStore";
import { motion } from "motion/react";

import styles from "./ThemeSelector.module.css";

export function ThemeSelector() {
  const { theme, setThemeDark, setThemeLight, setThemeDevice } =
    useThemeStore();

  const isDark = theme === "dark";
  const isLight = theme === "light";

  const SunIcon = ({ isLight }: { isLight: boolean }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={styles.ThemeIcon}
        data-src="https://hugeicons.storage.googleapis.com/icons/sun-03-stroke-rounded.svg?type=svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        role="img"
        style={{
          stroke: "var(--icon-color)",
          height: "100%",
          width: "100%",
          strokeWidth: 1.5,
        }}
      >
        <path d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"></path>
        <motion.path
          d="M12 2V3.5M12 20.5V22M19.0708 19.0713L18.0101 18.0106M5.98926 5.98926L4.9286 4.9286M22 12H20.5M3.5 12H2M19.0713 4.92871L18.0106 5.98937M5.98975 18.0107L4.92909 19.0714"
          strokeLinecap="round"
          className={styles.SunIconRay}
          initial={{ filter: "blur(0px)" }}
          animate={{
            rotate: isLight ? [0, 360] : 0,
            filter: isLight ? "blur(0.5px)" : "blur(0)",
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
        ></motion.path>
        <motion.path
          d="M17.4776 10.0001C17.485 10 17.4925 10 17.5 10C19.9853 10 22 12.0147 22 14.5C22 16.9853 19.9853 19 17.5 19H7C4.23858 19 2 16.7614 2 14C2 11.4003 3.98398 9.26407 6.52042 9.0227M17.4776 10.0001C17.4924 9.83536 17.5 9.66856 17.5 9.5C17.5 6.46243 15.0376 4 12 4C9.12324 4 6.76233 6.20862 6.52042 9.0227M17.4776 10.0001C17.3753 11.1345 16.9286 12.1696 16.2428 13M6.52042 9.0227C6.67826 9.00768 6.83823 9 7 9C8.12582 9 9.16474 9.37209 10.0005 10"
          initial={{ translateY: 3, translateX: "300%" }}
          animate={{
            fill: isLight ? "var(--hover-over-container)" : "transparent",
            translateX: isLight ? ["300%", "-300%"] : "300%",
            translateY: 3,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></motion.path>
      </svg>
    );
  };

  const MoonIcon = ({ isDark }: { isDark: boolean }) => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={styles.ThemeIcon}
        data-src="https://hugeicons.storage.googleapis.com/icons/moon-02-stroke-rounded.svg?type=svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        role="img"
        style={{
          stroke: "var(--icon-color)",
          height: "100%",
          width: "100%",
          strokeWidth: 1.5,
        }}
      >
        <motion.path
          d="M21.5 14.0784C20.3003 14.7189 18.9301 15.0821 17.4751 15.0821C12.7491 15.0821 8.91792 11.2509 8.91792 6.52485C8.91792 5.06986 9.28105 3.69968 9.92163 2.5C5.66765 3.49698 2.5 7.31513 2.5 11.8731C2.5 17.1899 6.8101 21.5 12.1269 21.5C16.6849 21.5 20.503 18.3324 21.5 14.0784Z"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transformOrigin: "50% 50%",
          }}
          animate={{ scale: isDark ? 1 : 1 }}
        ></motion.path>
        <motion.circle
          style={{
            transformOrigin: "50% 50%",
            fill: "var(--icon-color)",
          }}
          animate={{
            scale: isDark ? [0, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0] : 0,
            opacity: isDark ? [0, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0] : 0,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          cx="20"
          cy="5"
          r="1"
        />
        <motion.circle
          style={{
            transformOrigin: "50% 50%",
            fill: "var(--icon-color)",
          }}
          animate={{
            scale: isDark ? [0, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0] : 0,
            opacity: isDark ? [0, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0] : 0,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: isDark ? 2 : 0,
          }}
          cx="27"
          cy="1"
          r="1"
        />
        <motion.circle
          style={{
            transformOrigin: "50% 50%",
            fill: "var(--icon-color)",
          }}
          animate={{
            scale: isDark ? [0, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0] : 0,
            opacity: isDark ? [0, 1, 1, 0.5, 1, 0.5, 1, 0.5, 1, 0] : 0,
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
            delay: isDark ? 2 : 0,
          }}
          cx="28"
          cy="8"
          r="1"
        />
        <motion.path
          d="M17.4776 10.0001C17.485 10 17.4925 10 17.5 10C19.9853 10 22 12.0147 22 14.5C22 16.9853 19.9853 19 17.5 19H7C4.23858 19 2 16.7614 2 14C2 11.4003 3.98398 9.26407 6.52042 9.0227M17.4776 10.0001C17.4924 9.83536 17.5 9.66856 17.5 9.5C17.5 6.46243 15.0376 4 12 4C9.12324 4 6.76233 6.20862 6.52042 9.0227M17.4776 10.0001C17.3753 11.1345 16.9286 12.1696 16.2428 13M6.52042 9.0227C6.67826 9.00768 6.83823 9 7 9C8.12582 9 9.16474 9.37209 10.0005 10"
          initial={{ translateY: 3, translateX: "300%" }}
          animate={{
            fill: isDark ? "var(--hover-over-container)" : "transparent",
            translateX: isDark ? ["300%", "-300%"] : "300%",
            translateY: 3,
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
          strokeLinecap="round"
          strokeLinejoin="round"
        ></motion.path>
      </svg>
    );
  };

  const ComputerIcon = () => {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        className={styles.ThemeIcon}
        style={{
          stroke: "var(--icon-color)",
          height: "100%",
          strokeWidth: "1.5",
        }}
      >
        <path
          d="M14 2H10C6.72077 2 5.08116 2 3.91891 2.81382C3.48891 3.1149 3.1149 3.48891 2.81382 3.91891C2 5.08116 2 6.72077 2 10C2 13.2792 2 14.9188 2.81382 16.0811C3.1149 16.5111 3.48891 16.8851 3.91891 17.1862C5.08116 18 6.72077 18 10 18H14C17.2792 18 18.9188 18 20.0811 17.1862C20.5111 16.8851 20.8851 16.5111 21.1862 16.0811C22 14.9188 22 13.2792 22 10C22 6.72077 22 5.08116 21.1862 3.91891C20.8851 3.48891 20.5111 3.1149 20.0811 2.81382C18.9188 2 17.2792 2 14 2Z"
          strokeLinecap="round"
        />
        <path d="M11 15H13" strokeLinecap="round" strokeLinejoin="round" />
        <path
          d="M14.5 22L14.1845 21.5811C13.4733 20.6369 13.2969 19.1944 13.7468 18M9.5 22L9.8155 21.5811C10.5267 20.6369 10.7031 19.1944 10.2532 18"
          strokeLinecap="round"
        />
        <path d="M7 22H17" strokeLinecap="round" />
      </svg>
    );
  };

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
          setThemeLight();
        }}
      >
        <SunIcon isLight={isLight} />
      </button>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setThemeDark();
        }}
      >
        <MoonIcon isDark={isDark} />
      </button>
      <button
        className={styles.button}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setThemeDevice();
        }}
      >
        <ComputerIcon />
      </button>
    </section>
  );
}
