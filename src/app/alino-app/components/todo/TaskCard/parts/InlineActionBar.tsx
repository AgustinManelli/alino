"use client";

import { memo } from "react";
import { motion } from "motion/react";
import { Editor } from "@tiptap/react";

import { Calendar } from "@/components/ui/Calendar";
import { AIEnhanceButton } from "@/components/ui/AIEnhanceButton/AIEnhanceButton";

import { Cross, TickIcon } from "@/components/ui/icons/icons";

import styles from "../TaskCard.module.css";

interface InlineActionBarProps {
  editor: Editor | null;
  selected: Date | undefined;
  setSelected: (d: Date | undefined) => void;
  hour: string | undefined;
  setHour: (h: string | undefined) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const InlineActionBar = memo(function InlineActionBar({
  editor,
  selected,
  setSelected,
  hour,
  setHour,
  onSave,
  onCancel,
}: InlineActionBarProps) {
  return (
    <div className={styles.editingButtons}>
      <Calendar
        selected={selected}
        setSelected={setSelected}
        hour={hour}
        setHour={setHour}
        focusToParentInput={() => {}}
        className={styles.mainButton}
      />
      <AIEnhanceButton
        editor={editor}
        visible={true}
        showGenerateTasks={false}
        className={styles.mainButton}
      />
      <motion.button
        onClick={onSave}
        className={styles.mainButton}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title="Guardar (Enter)"
      >
        <TickIcon />
      </motion.button>
      <motion.button
        onClick={onCancel}
        className={styles.mainButton}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        title="Cancelar (Esc)"
      >
        <Cross />
      </motion.button>
    </div>
  );
});
