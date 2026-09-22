"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import { IAStars, Cross } from "@/components/ui/icons/icons";
import styles from "./AIAssistantChat.module.css";

interface Props {
  onOpenChat: () => void;
  isChatOpen: boolean;
  bottomOffset: number;
}

const TIPS = [
  "proactive.tip1",
  "proactive.tip2",
  "proactive.tip3",
  "proactive.tip4",
] as const;

export const ProactiveBubble = ({
  onOpenChat,
  isChatOpen,
  bottomOffset,
}: Props) => {
  const { t } = useTranslation(["assistant"]);
  const [visible, setVisible] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const autoHideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showNextTip = useCallback(() => {
    if (isChatOpen) return;
    setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
    setVisible(true);

    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }

    autoHideTimeoutRef.current = setTimeout(() => {
      setVisible(false);
    }, 8000);
  }, [isChatOpen]);

  useEffect(() => {
    if (isChatOpen) {
      setVisible(false);
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
      return;
    }

    const initialDelay = setTimeout(() => {
      showNextTip();
    }, 25000);

    const recurringInterval = setInterval(() => {
      showNextTip();
    }, 240000);

    return () => {
      clearTimeout(initialDelay);
      clearInterval(recurringInterval);
      if (autoHideTimeoutRef.current) {
        clearTimeout(autoHideTimeoutRef.current);
      }
    };
  }, [isChatOpen, showNextTip]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setVisible(false);
    if (autoHideTimeoutRef.current) {
      clearTimeout(autoHideTimeoutRef.current);
    }
  };

  return (
    <AnimatePresence>
      {visible && !isChatOpen && (
        <motion.div
          className={styles.proactiveBubble}
          initial={{ opacity: 0, scale: 0.9, x: 12, bottom: bottomOffset + 6 }}
          animate={{ opacity: 1, scale: 1, x: 0, bottom: bottomOffset + 6 }}
          exit={{ opacity: 0, scale: 0.9, x: 12 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          onClick={onOpenChat}
        >
          <div className={styles.proactiveBubbleIcon}>
            <IAStars style={{ width: 14, height: 14 }} />
          </div>
          <span className={styles.proactiveBubbleText}>
            {t(TIPS[currentTipIndex])}
          </span>
          <button
            className={styles.proactiveBubbleClose}
            onClick={handleDismiss}
            type="button"
            aria-label={t("close")}
          >
            <Cross style={{ width: 10, height: 10 }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
