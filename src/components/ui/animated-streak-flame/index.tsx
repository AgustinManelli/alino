"use client";

import React from "react";
import { motion, AnimatePresence, Transition } from "motion/react";
import styles from "./AnimatedStreakFlame.module.css";
import { ExclamationIcon } from "../icons/icons";

export type FlameStatus = "active" | "off" | "frozen";

interface AnimatedStreakFlameProps {
  status: FlameStatus;
  size?: number;
  className?: string;
  showWarning?: boolean;
}

const FLAME_PATH =
  "M12 22C7.58172 22 4 18.4183 4 14C4 10.5 7.5 5 12 2C16.5 5 20 10.5 20 14C20 18.4183 16.4183 22 12 22Z";

export const AnimatedStreakFlame = ({
  status,
  size = 40,
  className = "",
  showWarning = false,
}: AnimatedStreakFlameProps) => {
  const isOff = status === "off";
  const isActive = status === "active";
  const isFrozen = status === "frozen";

  const backFlameAnimate = {
    fill: isOff ? "#e5e7eb" : isActive ? "#f97316" : "#bae6fd",
    scale: isFrozen ? 0.85 : isOff ? [0.85, 0.87, 0.85] : [0.87, 0.9, 0.87],
    rotate: isFrozen
      ? -30
      : isOff
        ? [-30, -25, -30]
        : [-30, -20, -25, -20, -30],
    y: -2.2,
    x: 0.8,
  };

  const backFlameTransition: Transition = isFrozen
    ? { duration: 0.2, ease: "easeOut" }
    : {
        fill: { duration: 0.3 },
        scale: {
          duration: isOff ? 2 : 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: isOff ? 2.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const groupAnimate = {
    scale: isFrozen ? 1 : isOff ? [1, 1.02, 1] : [1, 1.05, 1.03, 1.05, 1],
    rotate: isFrozen ? -3 : isOff ? [-3, 3, -3] : [-6, 6, -4, 4, -6],
    y: 0,
  };

  const groupTransition: Transition = isFrozen
    ? { duration: 0.2, ease: "easeOut" }
    : {
        scale: {
          duration: isOff ? 2.2 : 1.6,
          repeat: Infinity,
          ease: "easeInOut",
        },
        rotate: {
          duration: isOff ? 2.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        },
      };

  const outlineColor = isActive
    ? "#f7da37ff"
    : isFrozen
      ? "#ffffff"
      : "#b8b8b8";

  return (
    <div
      className={`${styles.flameContainer} ${className}`}
      style={
        {
          width: size,
          height: size,
          position: "relative",
          "--flame-size": `${size}px`,
        } as React.CSSProperties
      }
    >
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        <motion.path
          d={FLAME_PATH}
          style={{ originX: "50%", originY: "90%" }}
          animate={{
            ...backFlameAnimate,
            fill: outlineColor,
            stroke: outlineColor,
            strokeWidth: 5,
            strokeLinejoin: "round",
          }}
          transition={backFlameTransition}
        />
        <motion.g
          style={{ originX: "50%", originY: "90%" }}
          animate={groupAnimate}
          transition={groupTransition}
        >
          <motion.path
            d={FLAME_PATH}
            animate={{
              fill: outlineColor,
              stroke: outlineColor,
              strokeWidth: 5,
              strokeLinejoin: "round",
            }}
            transition={{ duration: 0.3 }}
          />
        </motion.g>

        <motion.path
          d={FLAME_PATH}
          style={{ originX: "50%", originY: "90%" }}
          animate={backFlameAnimate}
          transition={backFlameTransition}
        />
        <motion.g
          style={{ originX: "50%", originY: "90%" }}
          animate={groupAnimate}
          transition={groupTransition}
        >
          <motion.path
            d={FLAME_PATH}
            animate={{
              fill: isOff ? "#e5e7eb" : isActive ? "#f97316" : "#bae6fd",
            }}
            transition={{ duration: 0.3 }}
          />

          <motion.path
            d={FLAME_PATH}
            style={{ originX: "50%", originY: "90%" }}
            animate={{
              fill: isOff ? "#d8dadf" : isActive ? "#f7b337ff" : "#8fd6fc",
              scale: isFrozen
                ? 0.3
                : isOff
                  ? [0.3, 0.32, 0.3]
                  : [0.3, 0.35, 0.35, 0.37, 0.3],
              rotate: isFrozen ? -3 : [-3, 3, -3],
              opacity: isFrozen
                ? 0.6
                : isOff
                  ? [0.6, 0.7, 0.6]
                  : [0.8, 1, 0.9, 1, 0.8],
            }}
            transition={
              isFrozen
                ? { duration: 0.2, ease: "easeOut" }
                : {
                    scale: {
                      duration: isOff ? 2 : 0.9,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2,
                    },
                    opacity: {
                      duration: isOff ? 2 : 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.15,
                    },
                    rotate: {
                      duration: isOff ? 2 : 0.8,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.15,
                    },
                  }
            }
          />
        </motion.g>
      </motion.svg>

      <AnimatePresence>
        {showWarning && (
          <motion.div
            className={styles.warningIcon}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [1, 1.1, 1],
              opacity: 1,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              scale: {
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              },
              opacity: { duration: 0.2 },
            }}
            style={{
              borderWidth: Math.max(1, size * 0.035),
              boxShadow: `0 ${size * 0.04}px ${size * 0.08}px rgba(0, 0, 0, 0.2)`,
            }}
          >
            <ExclamationIcon className={styles.exclamationIcon} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
