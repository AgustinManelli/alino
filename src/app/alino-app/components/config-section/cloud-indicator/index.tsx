"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

import { useCloudStore } from "@/store/useCloudStore";

export function CloudIndicator() {
  const [isVisible, setIsVisible] = useState(false);

  const { queue } = useCloudStore();

  useEffect(() => {
    if (queue !== undefined) {
      setIsVisible(true);

      if (queue === 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [queue]);

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="25"
          height="25"
          fill="none"
          style={{
            position: "absolute",
            left: "-35px",
            strokeWidth: "1.5",
            stroke: "#1c1c1c",
            display: "flex",
            zIndex: 0,
          }}
          initial={{ opacity: 0, x: 20, scale: 0.5 }}
          animate={{ opacity: 0.3, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 20, scale: 0.5 }}
        >
          <path
            d="M17.5,8.1h0c2.5,0,4.5,2,4.5,4.5s-.8,2.7-2,3.5M17.5,8.1c0-.2,0-.3,0-.5,0-3-2.5-5.5-5.5-5.5s-5.2,2.2-5.5,5M17.5,8.1c-.1,1.1-.5,2.2-1.2,3M6.5,7.2c-2.5.2-4.5,2.4-4.5,5s.8,3.1,2.1,4M6.5,7.2c.2,0,.3,0,.5,0,1.1,0,2.2.4,3,1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <AnimatePresence mode="wait">
            {queue === 0 ? (
              <motion.g
                key="success"
                initial="hidden"
                animate={["visible", "colored"]}
                exit="exit"
                variants={successVariants}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.8,16.9c0,2.6-2.1,4.8-4.8,4.8s-4.8-2.1-4.8-4.8,2.1-4.8,4.8-4.8,4.8,2.1,4.8,4.8Z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.1,17.1s1,.3,1.4,1.2c0,0,1-2.4,2.4-2.9"
                />
              </motion.g>
            ) : (
              <motion.g
                key="loading"
                variants={loaderVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <motion.path
                  variants={loaderItemVariants}
                  d="M12,20v1.6"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M15.3,20.2l-1.1-1.1"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M16.7,16.9h-1.6"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M15.3,13.5l-1.1,1.1"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M12,12.1v1.6"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M9.8,14.6l-1.1-1.1"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M8.9,16.9h-1.6"
                  strokeLinecap="round"
                />
                <motion.path
                  variants={loaderItemVariants}
                  d="M9.8,19.1l-1.1,1.1"
                  strokeLinecap="round"
                />
              </motion.g>
            )}
          </AnimatePresence>
        </motion.svg>
      )}
    </AnimatePresence>
  );
}

const successVariants = {
  hidden: {
    opacity: 0,
    scale: 0,
    stroke: "#1c1c1c",
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 0.2 },
    },
  },
  colored: {
    stroke: "#22c55e",
    transition: {
      delay: 0.3,
      duration: 0.5,
    },
  },
  exit: {
    opacity: 0,
    scale: 0,
    transition: {
      opacity: { duration: 0.2 },
    },
  },
};

const loaderVariants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
  exit: {
    opacity: 0,
  },
};

const loaderItemVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: [0, 1, 0],
    transition: {
      repeat: Infinity,
      duration: 1,
    },
  },
};
