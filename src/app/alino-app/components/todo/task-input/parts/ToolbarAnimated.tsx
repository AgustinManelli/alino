"use client";

import { memo } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Editor } from "@tiptap/react";

import { RichTextToolbar } from "@/components/ui/RichTextEditor/RichTextToolbar";

import styles from "../task-input.module.css";

const TOOLBAR_ENTER_TRANSITION = {
  type: "spring",
  stiffness: 320,
  damping: 30,
  mass: 0.7,
} as const;

const TOOLBAR_EXIT_TRANSITION = {
  duration: 0.18,
  ease: [0.4, 0, 1, 1],
} as const;

interface ToolbarAnimatedProps {
  editor: Editor | null;
  focus: boolean;
}

export const ToolbarAnimated = memo(function ToolbarAnimated({
  editor,
  focus,
}: ToolbarAnimatedProps) {
  return (
    <AnimatePresence>
      {focus && (
        <motion.div
          key="toolbar-animation"
          className={styles.toolbarWrapper}
          style={{ transformOrigin: "top center", overflow: "hidden" }}
          initial={{
            opacity: 0,
            scaleY: 0.7,
            y: -6,
            height: 0,
          }}
          animate={{
            opacity: 1,
            scaleY: 1,
            y: 0,
            height: "auto",
            transition: TOOLBAR_ENTER_TRANSITION,
          }}
          exit={{
            opacity: 0,
            scaleY: 0.85,
            y: -4,
            height: 0,
            transition: TOOLBAR_EXIT_TRANSITION,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <RichTextToolbar editor={editor} />
        </motion.div>
      )}
    </AnimatePresence>
  );
});
