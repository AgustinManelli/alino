"use client";
import { memo } from "react";
import { motion } from "motion/react";
import type { Variants } from "motion/react";
import type { TaskType } from "@/lib/schemas/database.types";
import { DragDropVerticalIcon } from "@/components/ui/icons/icons";
import { isHtmlContent } from "@/components/ui/RichTextEditor/richTextUtils";
import { linkifyWithIcon } from "@/utils/linkify";
import styles from "./TaskCard.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";

const overlayVariants: Variants = {
  hidden: { opacity: 1 },
  visible: {
    rotate: [-1, 1],
    x: [-0.5, 0.5],
    y: [-0.5, 0.5],
    transition: {
      duration: 0.12,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse",
    },
  },
};

export const DragTaskCard = memo(({ task }: { task: TaskType }) => {
  const animations = useUserPreferencesStore((state) => state.animations);
  const isHtml = isHtmlContent(task.task_content);
  const completed = task.completed;

  return (
    <div style={{ width: "100%", pointerEvents: "none" }}>
      <motion.div
        className={styles.cardContainer}
        variants={animations ? overlayVariants : undefined}
        initial="hidden"
        animate="visible"
        style={{
          boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.3)",
          scale: 1.02,
        }}
      >
        <div
          className={styles.dragDropContainer}
          style={{ width: "30px", opacity: 1 }}
        >
          <div className={styles.dragDropIcon}>
            <DragDropVerticalIcon
              style={{
                width: "16px",
                height: "16px",
                stroke: "var(--text)",
                strokeWidth: 2,
              }}
            />
          </div>
        </div>

        <div className={styles.textContainer}>
          {isHtml ? (
            <div
              className={styles.text}
              style={{ opacity: completed ? 0.3 : 1 }}
              dangerouslySetInnerHTML={{
                __html: task.task_content.slice(0, 200),
              }}
            />
          ) : (
            <p className={styles.text} style={{ opacity: completed ? 0.3 : 1 }}>
              {linkifyWithIcon(task.task_content.slice(0, 200))}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
});
