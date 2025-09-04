"use client";

export const variants = {
  initial: { scale: 0, opacity: 0, zIndex: 1 },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring", stiffness: 50 },
  },
  exit: {
    scale: 1.3,
    opacity: 0,
    filter: "blur(30px) grayscale(100%)",
    y: -30,
    transition: { duration: 1 },
    zIndex: "0",
  },
} as const;
