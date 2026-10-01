"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

type Phase = "word" | "loader";

const VIEWBOX_WIDTH = 723.83;
const VIEWBOX_HEIGHT = 308.33;
const ASPECT_RATIO = VIEWBOX_HEIGHT / VIEWBOX_WIDTH;

const WORD_HOLD_MS = 0;
const RING_SIZE_RATIO = 1;
const RING_RADIUS = 40;
const RING_STROKE = 10;
const RING_CYCLES = 2;
const RING_CYCLE_SECONDS = 1.2;
const RING_START_DELAY = 0.1;
const DOT_LENGTH = 0.001;

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

const letterVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 14,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

const detailVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 14,
      delay: 0.15,
    },
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: {
      duration: 0.1,
      ease: "easeIn",
    },
  },
};

const ringCycleTransition = {
  delay: RING_START_DELAY,
  duration: RING_CYCLE_SECONDS,
  times: [0, 0.5, 1],
  ease: "easeInOut" as const,
  repeat: RING_CYCLES - 1,
};

const ringTransition = {
  pathLength: ringCycleTransition,
  pathOffset: ringCycleTransition,
  rotate: {
    delay: RING_START_DELAY,
    duration: RING_CYCLE_SECONDS * RING_CYCLES,
    ease: "linear" as const,
  },
};

function WordMark({
  animated,
  onEntered,
}: {
  animated: boolean;
  onEntered?: () => void;
}) {
  const letter = animated ? letterVariants : undefined;
  const detail = animated ? detailVariants : undefined;
  const pathStyle: CSSProperties = {
    transformBox: "fill-box",
    transformOrigin: "center",
  };

  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
      width="100%"
      style={{ overflow: "visible", gridArea: "1 / 1" }}
      variants={animated ? containerVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "visible" : undefined}
      exit={animated ? "exit" : undefined}
      onAnimationComplete={(definition) => {
        if (animated && definition === "visible") {
          onEntered?.();
        }
      }}
    >
      <g>
        <motion.path
          variants={detail}
          style={pathStyle}
          d="M195.99,307.74l19.22-19.22c.78-.78,2.05-.78,2.83,0l19.22,19.22c1.26,1.26,3.41.37,3.41-1.41v-38.26c0-2.76-2.24-5-5-5h-38.09c-2.76,0-5,2.24-5,5v38.26c0,1.78,2.15,2.67,3.41,1.41Z"
        />
        <g>
          <motion.path
            variants={letter}
            style={pathStyle}
            d="M57.57,247.66c-11.06,0-20.92-1.94-29.57-5.81-8.65-3.88-15.48-9.63-20.49-17.27-5.01-7.64-7.51-17.18-7.51-28.62,0-9.63,1.77-17.72,5.31-24.27,3.54-6.55,8.35-11.81,14.45-15.8,6.1-3.99,13.04-7,20.83-9.03,7.79-2.03,15.97-3.46,24.55-4.29,10.08-1.05,18.21-2.05,24.38-2.99,6.17-.94,10.65-2.35,13.43-4.23,2.78-1.88,4.18-4.67,4.18-8.35v-.68c0-7.15-2.24-12.68-6.72-16.59-4.48-3.91-10.82-5.87-19.02-5.87-8.66,0-15.54,1.9-20.66,5.7-4.08,3.03-7.07,6.68-8.95,10.93-.87,1.97-2.86,3.21-5.01,3.04l-34.74-2.82c-3.18-.26-5.33-3.39-4.39-6.44,2.5-8.06,6.42-15.2,11.77-21.42,6.62-7.71,15.18-13.66,25.68-17.84,10.5-4.18,22.67-6.26,36.52-6.26,9.63,0,18.87,1.13,27.71,3.39,8.84,2.26,16.71,5.76,23.59,10.5s12.32,10.82,16.31,18.23c3.99,7.41,5.98,16.27,5.98,26.58v111.95c0,2.76-2.24,5-5,5h-35.6c-2.76,0-5-2.24-5-5v-19.04h-1.35c-2.79,5.42-6.51,10.18-11.18,14.28-4.67,4.1-10.27,7.3-16.82,9.59-6.55,2.29-14.11,3.44-22.69,3.44ZM71.34,214.48c7.07,0,13.32-1.41,18.74-4.23,5.42-2.82,9.67-6.64,12.76-11.46,3.08-4.82,4.63-10.27,4.63-16.37v-11.19c0-3.2-3.09-5.49-6.15-4.55h0c-2.6.79-5.51,1.51-8.75,2.14-3.24.64-6.47,1.21-9.71,1.69-3.24.49-6.17.92-8.8,1.3-5.64.83-10.57,2.15-14.79,3.95-4.22,1.81-7.49,4.23-9.82,7.28-2.33,3.05-3.5,6.83-3.5,11.34,0,6.55,2.39,11.53,7.17,14.96,4.78,3.43,10.85,5.14,18.23,5.14Z"
          />
          <motion.path
            variants={letter}
            style={pathStyle}
            d="M240.66,18.21v221.18c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5V18.21c0-2.76,2.24-5,5-5h38.09c2.76,0,5,2.24,5,5Z"
          />
          <motion.path
            variants={letter}
            style={pathStyle}
            d="M303.19,48.65c-7.15,0-13.26-2.39-18.34-7.17-5.08-4.78-7.62-10.52-7.62-17.21s2.54-12.32,7.62-17.1c5.08-4.78,11.19-7.17,18.34-7.17s13.26,2.39,18.34,7.17c5.08,4.78,7.62,10.48,7.62,17.1s-2.54,12.44-7.62,17.21c-5.08,4.78-11.19,7.17-18.34,7.17ZM279.04,239.39V76c0-2.76,2.24-5,5-5h38.09c2.76,0,5,2.24,5,5v163.39c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5Z"
          />
          <motion.path
            variants={letter}
            style={pathStyle}
            d="M413.59,144.15v95.24c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5V76c0-2.76,2.24-5,5-5h35.83c2.76,0,5,2.24,5,5v25.59h2.03c3.84-10.08,10.27-18.08,19.3-23.99,9.03-5.91,19.98-8.86,32.85-8.86,12.04,0,22.54,2.63,31.49,7.9,8.96,5.27,15.92,12.78,20.88,22.52,4.97,9.75,7.45,21.35,7.45,34.82v105.4c0,2.76-2.24,5-5,5h-38.09c-2.76,0-5-2.24-5-5v-96.82c.07-10.61-2.63-18.91-8.13-24.89-5.49-5.98-13.06-8.97-22.69-8.97-6.47,0-12.17,1.39-17.1,4.18-4.93,2.79-8.77,6.83-11.51,12.13s-4.16,11.68-4.23,19.13Z"
          />
          <motion.path
            variants={letter}
            style={pathStyle}
            d="M638.49,247.78c-17.54,0-32.68-3.74-45.44-11.23-12.76-7.49-22.6-17.95-29.52-31.38-6.93-13.43-10.38-29.03-10.38-46.79s3.46-33.58,10.38-47.01c6.92-13.43,16.76-23.89,29.52-31.38,12.76-7.49,27.9-11.23,45.44-11.23s32.68,3.74,45.44,11.23c12.75,7.49,22.59,17.95,29.52,31.38,6.92,13.43,10.38,29.11,10.38,47.01s-3.46,33.36-10.38,46.79c-6.92,13.43-16.76,23.89-29.52,31.38-12.76,7.49-27.9,11.23-45.44,11.23ZM638.72,210.52c7.97,0,14.63-2.28,19.98-6.83,5.34-4.55,9.39-10.78,12.13-18.68,2.75-7.9,4.12-16.89,4.12-26.98s-1.38-19.08-4.12-26.98c-2.75-7.9-6.79-14.15-12.13-18.74-5.34-4.59-12-6.89-19.98-6.89s-14.81,2.3-20.26,6.89c-5.46,4.59-9.56,10.84-12.3,18.74-2.75,7.9-4.12,16.9-4.12,26.98s1.37,19.08,4.12,26.98c2.75,7.9,6.85,14.13,12.3,18.68,5.46,4.55,12.21,6.83,20.26,6.83Z"
          />
        </g>
      </g>
    </motion.svg>
  );
}

function RingLoader({
  size,
  onComplete,
}: {
  size: number;
  onComplete: () => void;
}) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      width={size}
      height={size}
      aria-hidden="true"
      style={{ overflow: "visible", gridArea: "1 / 1" }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{
        scale: 1,
        opacity: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      }}
      exit={{
        scale: 0,
        opacity: 0,
        transition: { duration: 0.25, ease: "easeIn" },
      }}
    >
      <motion.circle
        cx={50}
        cy={50}
        r={RING_RADIUS}
        fill="none"
        stroke="currentColor"
        strokeWidth={RING_STROKE}
        strokeLinecap="round"
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ pathLength: DOT_LENGTH, pathOffset: 0, rotate: -90 }}
        animate={{
          pathLength: [DOT_LENGTH, 1, DOT_LENGTH],
          pathOffset: [0, 0, 1],
          rotate: [-90, -90 + 360 * RING_CYCLES],
        }}
        transition={ringTransition}
        onAnimationComplete={onComplete}
      />
    </motion.svg>
  );
}

export const AlinoLogoLoader = memo(function IconAlinoLoader({
  style,
  className,
  width = 120,
}: {
  style?: CSSProperties;
  className?: string;
  width?: number;
}) {
  const animations = useUserPreferencesStore((state) => state.animations);
  const [phase, setPhase] = useState<Phase>("word");
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearTimeout(holdTimer.current);
    };
  }, []);

  const handleWordEntered = useCallback(() => {
    if (holdTimer.current) clearTimeout(holdTimer.current);
    holdTimer.current = setTimeout(() => setPhase("loader"), WORD_HOLD_MS);
  }, []);

  const handleRingComplete = useCallback(() => {
    setPhase("word");
  }, []);

  const ringSize = width * ASPECT_RATIO * RING_SIZE_RATIO;

  return (
    <div
      role="status"
      aria-label="Cargando"
      className={className}
      style={{
        display: "inline-grid",
        placeItems: "center",
        width,
        aspectRatio: `${VIEWBOX_WIDTH} / ${VIEWBOX_HEIGHT}`,
        ...style,
      }}
    >
      {animations ? (
        <AnimatePresence mode="wait">
          {phase === "word" ? (
            <WordMark key="word" animated onEntered={handleWordEntered} />
          ) : (
            <RingLoader
              key="ring"
              size={ringSize}
              onComplete={handleRingComplete}
            />
          )}
        </AnimatePresence>
      ) : (
        <WordMark animated={false} />
      )}
    </div>
  );
});
