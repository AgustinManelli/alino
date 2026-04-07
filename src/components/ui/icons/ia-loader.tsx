"use client";

import type { CSSProperties } from "react";
import { motion, useAnimation } from "motion/react";
import { useEffect, useMemo, memo } from "react";
import styles from "./IALoader.module.css";

export interface IAStarsLoaderProps {
  size?: number | string;
  color?: string;
  duration?: number;
  strokeWidth?: number;
  className?: string;
  style?: CSSProperties;
  title?: string;
  animated?: boolean;
}

const staticState = { scale: 1, opacity: 1 };

export const IAStarsLoader = memo(function IAStarsLoader({
  size = 48,
  color = "currentColor",
  strokeWidth = 1.5,
  className,
  style,
  title = "Cargando",
  animated = true,
}: IAStarsLoaderProps) {
  const mergedStyle = useMemo(
    () =>
      ({
        ...style,
        "--ia-size": typeof size === "number" ? `${size}px` : size,
        "--ia-color": color,
        "--ia-stroke-width": strokeWidth,
      }) as React.CSSProperties,
    [style, size, color, strokeWidth],
  );

  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  const mainControls = useAnimation();
  const leftControls = useAnimation();
  const rightControls = useAnimation();

  useEffect(() => {
    let isMounted = true;

    if (!animated) return;

    const runSequence = async () => {
      const popDuration = 0.4;
      const staggerDelay = 300;

      if (!isMounted) return;
      mainControls.start({
        scale: 1,
        opacity: 1,
        transition: { duration: popDuration, ease: "easeOut" },
      });

      await new Promise((r) => setTimeout(r, staggerDelay));
      if (!isMounted) return;

      leftControls.start({
        scale: 1,
        opacity: 1,
        transition: { duration: popDuration, ease: "easeOut" },
      });

      await new Promise((r) => setTimeout(r, staggerDelay));
      if (!isMounted) return;

      rightControls.start({
        scale: 1,
        opacity: 1,
        transition: { duration: popDuration, ease: "easeOut" },
      });

      await new Promise((r) => setTimeout(r, popDuration * 1000));
      if (!isMounted) return;

      const loopTransition = {
        duration: 0.8,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: "easeInOut" as const,
      };

      mainControls.start({
        scale: [1, 0.9, 1],
        opacity: [1, 0.2, 1],
        transition: loopTransition,
      });

      await new Promise((r) => setTimeout(r, staggerDelay));
      if (!isMounted) return;

      leftControls.start({
        scale: [1, 0.9, 1],
        opacity: [1, 0.2, 1],
        transition: loopTransition,
      });

      await new Promise((r) => setTimeout(r, staggerDelay));
      if (!isMounted) return;

      rightControls.start({
        scale: [1, 0.9, 1],
        opacity: [1, 0.2, 1],
        transition: loopTransition,
      });
    };

    runSequence();

    return () => {
      isMounted = false;
      mainControls.stop();
      leftControls.stop();
      rightControls.stop();
    };
  }, [animated, mainControls, leftControls, rightControls]);

  return (
    <span
      className={rootClassName}
      style={mergedStyle}
      role="img"
      aria-label={title}
    >
      <svg
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <motion.path
          className={`${styles.star} ${styles.mainStar}`}
          d="M3 12C7.5 12 12 7.5 12 3C12 7.5 16.5 12 21 12C16.5 12 12 16.5 12 21C12 16.5 7.5 12 3 12Z"
          vectorEffect="non-scaling-stroke"
          initial={animated ? { scale: 0.5, opacity: 0 } : staticState}
          animate={animated ? mainControls : staticState}
        />
        <motion.path
          className={`${styles.star} ${styles.smallStarLeft}`}
          d="M2 19.5C2.83333 19.5 4.5 17.8333 4.5 17C4.5 17.8333 6.16667 19.5 7 19.5C6.16667 19.5 4.5 21.1667 4.5 22C4.5 21.1667 2.83333 19.5 2 19.5Z"
          vectorEffect="non-scaling-stroke"
          initial={animated ? { scale: 0.5, opacity: 0 } : staticState}
          animate={animated ? leftControls : staticState}
        />
        <motion.path
          className={`${styles.star} ${styles.smallStarRight}`}
          d="M16 5C17 5 19 3 19 2C19 3 21 5 22 5C21 5 19 7 19 8C19 7 17 5 16 5Z"
          vectorEffect="non-scaling-stroke"
          initial={animated ? { scale: 0.5, opacity: 0 } : staticState}
          animate={animated ? rightControls : staticState}
        />
      </svg>
    </span>
  );
});
