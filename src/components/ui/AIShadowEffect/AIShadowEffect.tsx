import React from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./AIShadowEffect.module.css";

interface AIShadowEffectProps {
  visible: boolean;
  boxShadow?: string;
  className?: string;
}

export const AIShadowEffect: React.FC<AIShadowEffectProps> = ({
  visible,
  boxShadow,
  className,
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={`${styles.bgContainer} ${className || ""}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.div
            className={styles.panelBgOne}
            style={boxShadow ? { boxShadow } : {}}
            animate={{
              scale: [1.1, 1.3, 1.1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.div
            className={styles.panelBgTwo}
            animate={{
              scale: [1.1, 1.3, 1.1],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
