import React from "react";
import { motion, AnimatePresence } from "motion/react";
import styles from "./AIShadowEffect.module.css";

interface AIShadowEffectProps {
  visible: boolean;
  boxShadow?: string;
  className?: string;
  animation?: boolean;
}

export const AIShadowEffect: React.FC<AIShadowEffectProps> = ({
  visible,
  boxShadow,
  className,
  animation = true,
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
            animate={
              animation
                ? { scale: [1.1, 1.3, 1.1], opacity: [0.6, 1, 0.6] }
                : { scale: 1, opacity: 1 }
            }
            transition={
              animation
                ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
          />
          <motion.div
            className={styles.panelBgTwo}
            animate={
              animation
                ? { scale: [1.1, 1.3, 1.1], opacity: [0.6, 1, 0.6] }
                : { scale: 1, opacity: 1 }
            }
            transition={
              animation
                ? { duration: 3, repeat: Infinity, ease: "easeInOut" }
                : { duration: 0 }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
