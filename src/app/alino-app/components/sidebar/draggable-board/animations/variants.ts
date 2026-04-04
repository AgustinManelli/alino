import type { Variants } from "motion/react";

export const variants: Variants = {
  initial: { scale: 0, opacity: 0, zIndex: 1 },
  visible: (index = 0) => ({
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: { type: "spring" as const, stiffness: 50, delay: index * 0.05 },
  }),
  exit: {
    scale: 1.3,
    opacity: 0,
    filter: "blur(30px) grayscale(100%)",
    y: -30,
    transition: { duration: 1 },
    zIndex: "0",
  },
};
