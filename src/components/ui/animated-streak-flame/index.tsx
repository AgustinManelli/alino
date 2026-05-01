"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "motion/react";
import styles from "./AnimatedStreakFlame.module.css";

export type FlameStatus = "active" | "off" | "frozen";

interface AnimatedStreakFlameProps {
  status: FlameStatus;
  size?: number;
  className?: string;
}

const FLAME_PATH =
  "M12 22C7.58172 22 4 18.4183 4 14C4 10.5 7.5 5 12 2C16.5 5 20 10.5 20 14C20 18.4183 16.4183 22 12 22Z";

const shards = [
  {
    id: "shard-1",
    clip: "6.3,0.5 11.0,7.2 17.4,4.1 24.0,2.8 30,-5 -5,-5",
    exitX: 5,
    exitY: -20,
    exitR: 25,
  },
  {
    id: "shard-2",
    clip: "24.0,2.8 17.4,4.1 11.0,7.2 13.6,11.2 18.9,14.0 24.0,14.8 30,14.8 30,-5",
    exitX: 25,
    exitY: -5,
    exitR: 45,
  },
  {
    id: "shard-3",
    clip: "24.0,14.8 18.9,14.0 13.6,11.2 12.3,17.1 7.4,20.8 7.4,30 30,30 30,14.8",
    exitX: 18,
    exitY: 20,
    exitR: 30,
  },
  {
    id: "shard-4",
    clip: "7.4,20.8 12.3,17.1 13.6,11.2 11.0,7.2 12.3,9.2 7.4,10.4 3.2,17.0 -5,17.0 -5,30 7.4,30",
    exitX: 0,
    exitY: 25,
    exitR: -15,
  },
  {
    id: "shard-5",
    clip: "3.2,17.0 7.4,10.4 0.5,6.9 -5,6.9 -5,17.0",
    exitX: -22,
    exitY: 10,
    exitR: -50,
  },
  {
    id: "shard-6",
    clip: "0.5,6.9 7.4,10.4 12.3,9.2 11.0,7.2 6.3,0.5 -5,-5 -5,6.9",
    exitX: -18,
    exitY: -15,
    exitR: -35,
  },
];

const shardVariants: Variants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    x: 0,
    y: 0,
    rotate: 0,
    transition: { duration: 0.35, type: "spring" as const, bounce: 0.4 },
  },
  exit: (custom: any) => ({
    opacity: 0,
    x: custom.exitX,
    y: custom.exitY,
    rotate: custom.exitR,
    scale: 0.4,
    transition: { duration: 0.4, ease: "easeOut" },
  }),
};

const IceBlock = () => (
  <g>
    <path
      d={FLAME_PATH}
      fill="#ffffff"
      stroke="#ffffff"
      strokeWidth={3.5}
      strokeLinejoin="round"
      style={{
        transformOrigin: "12px 21.6px",
        transform: "translate(1px, -2px) rotate(-30deg) scale(0.85)",
      }}
    />
    <path
      d={FLAME_PATH}
      fill="#ffffff"
      stroke="#ffffff"
      strokeWidth={3.5}
      strokeLinejoin="round"
      style={{ transformOrigin: "12px 21.6px", transform: "rotate(-3deg)" }}
    />

    <path
      d={FLAME_PATH}
      fill="#dff6ffb6"
      style={{
        transformOrigin: "12px 21.6px",
        transform: "translate(1px, -2px) rotate(-30deg) scale(0.85)",
      }}
    />
    <path
      d={FLAME_PATH}
      fill="#dff6ffb6"
      style={{ transformOrigin: "12px 21.6px", transform: "rotate(-3deg)" }}
    />

    <path
      d="M112.1,13.25l-30.65,6.04-30.06,14.38L29.49,2.42M34.68,97.1l22.76-17.37,6.27-27.45-12.32-18.6M63.71,52.28l24.71,13.11,23.67,3.77M2.42,32.13l32.26,16.37,22.79-5.65M15.14,79.47l19.54-30.97"
      stroke="#ffffff91"
      strokeWidth={7}
      fill="none"
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ transform: "scale(0.214)" }}
    />
  </g>
);

const FrozenOverlay = () => {
  return (
    <g>
      <defs>
        {shards.map((s) => (
          <clipPath id={s.id} key={s.id}>
            <polygon points={s.clip} />
          </clipPath>
        ))}
      </defs>

      {shards.map((s) => (
        <motion.g
          key={s.id}
          clipPath={`url(#${s.id})`}
          custom={s}
          variants={shardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          style={{ originX: "12px", originY: "12px" }}
        >
          <IceBlock />
        </motion.g>
      ))}
    </g>
  );
};

export const AnimatedStreakFlame = ({
  status,
  size = 40,
  className = "",
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

  const backFlameTransition: any = isFrozen
    ? { duration: 0.2, ease: "easeOut" as const }
    : {
        fill: { duration: 0.3 },
        scale: {
          duration: isOff ? 2 : 1.6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
        rotate: {
          duration: isOff ? 2.5 : 2,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const groupAnimate = {
    scale: isFrozen ? 1 : isOff ? [1, 1.02, 1] : [1, 1.05, 1.03, 1.05, 1],
    rotate: isFrozen ? -3 : isOff ? [-3, 3, -3] : [-6, 6, -4, 4, -6],
    y: 0,
  };

  const groupTransition: any = isFrozen
    ? { duration: 0.2, ease: "easeOut" as const }
    : {
        scale: {
          duration: isOff ? 2.2 : 1.6,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
        rotate: {
          duration: isOff ? 2.5 : 2,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      };

  const outlineColor = "#f7da37ff";

  return (
    <div
      className={`${styles.flameContainer} ${className}`}
      style={{ width: size, height: size, position: "relative" }}
    >
      <motion.svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ width: "100%", height: "100%", overflow: "visible" }}
      >
        {/* Yellow Outline Background Layer */}
        {isActive && (
          <>
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
          </>
        )}

        {/* Main Flame Layer */}
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

        <AnimatePresence>{isFrozen && <FrozenOverlay />}</AnimatePresence>
      </motion.svg>
    </div>
  );
};
