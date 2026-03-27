"use client";

import { motion, AnimatePresence } from "motion/react";
import { SmartDateResult } from "@/hooks/useSmartDate";
import styles from "./SmartDateBubble.module.css";
import { Calendar as CalendarIcon } from "@/components/ui/icons/icons";

interface Props {
  detected: SmartDateResult | null;
  onAssign: (date: Date, hour?: string, rawText?: string) => void;
  onDismiss: () => void;
  style?: React.CSSProperties;
}

export const SmartDateBubble = ({
  detected,
  onAssign,
  onDismiss,
  style,
}: Props) => {
  if (!detected) return null;

  const formattedDate = detected.date.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  });

  const formattedTime = detected.hour ? ` a las ${detected.hour}` : "";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={styles.bubbleContainer}
        style={style}
      >
        <button
          className={styles.bubbleButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onAssign(detected.date, detected.hour, detected.text);
          }}
        >
          <CalendarIcon
            style={{
              width: "16px",
              height: "auto",
              stroke: "#87189d",
              strokeWidth: "2",
            }}
          />
          <span className={styles.bubbleText}>
            <strong className={styles.highlight}>
              {formattedDate}
              {formattedTime}
            </strong>
          </span>
        </button>

        <button
          className={styles.dismissButton}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDismiss();
          }}
          aria-label="Ignorar sugerencia"
        >
          &times;
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
