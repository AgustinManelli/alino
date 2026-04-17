import type { Variants } from "motion/react";

export const variants: Variants = {
  initial: { opacity: 0, y: 10},
  visible: (index = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "tween",
      ease: "easeOut",
      duration: 0.18,
      delay: Math.min(index * 0.04, 0.2),
    },
  }),
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.15 },
  },
};