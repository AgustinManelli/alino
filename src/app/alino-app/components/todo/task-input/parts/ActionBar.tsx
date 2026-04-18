"use client";

import { memo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Editor } from "@tiptap/react";

import { Calendar } from "@/components/ui/Calendar";
import { AIEnhanceButton } from "@/components/ui/AIEnhanceButton/AIEnhanceButton";

import { SendIcon } from "@/components/ui/icons/icons";

import { ListsType } from "@/lib/schemas/database.types";
import styles from "../task-input.module.css";

interface ActionBarProps {
  focus: boolean;
  selected: Date | undefined;
  setSelected: (d: Date | undefined) => void;
  hour: string | undefined;
  setHour: (h: string | undefined) => void;
  editor: Editor | null;
  setList?: ListsType;
  onAddTasks: (
    tasks: {
      list_id: string;
      task_content: string;
      target_date: string | null;
      note: boolean;
    }[],
  ) => Promise<{ error: any } | undefined>;
  onSend: () => void;
}

export const ActionBar = memo(function ActionBar({
  focus,
  selected,
  setSelected,
  hour,
  setHour,
  editor,
  setList,
  onAddTasks,
  onSend,
}: ActionBarProps) {
  const handleCreateTasks = useCallback(
    async (
      tasks: { text: string; target_date: string | null; type: string }[],
    ) => {
      const listId = setList?.list_id;
      if (!listId) return { error: "No se seleccionó ninguna lista." };
      try {
        await onAddTasks(
          tasks.map((t) => ({
            list_id: listId,
            task_content: `<p>${t.text}</p>`,
            target_date: t.target_date,
            note: t.type === "note",
          })),
        );
        return { error: null };
      } catch (err: any) {
        return {
          error: err.message || "Ocurrió un error al crear las tareas.",
        };
      }
    },
    [setList, onAddTasks],
  );

  return (
    <div className={styles.inputManagerContainer}>
      <AnimatePresence>
        {focus && (
          <motion.div
            key="calendar"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ delay: 0.04 }}
            layout
          >
            <Calendar
              selected={selected}
              setSelected={setSelected}
              hour={hour}
              setHour={setHour}
              focusToParentInput={() => editor?.commands.focus()}
            />
          </motion.div>
        )}

        <AnimatePresence>
          {focus && (
            <motion.div
              key="ai-btn"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ delay: 0.08 }}
              layout
            >
              <AIEnhanceButton
                editor={editor}
                visible
                onCreateTasks={handleCreateTasks}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Vertical separator */}
        <motion.div
          key="sep"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: focus ? 30 : 0, opacity: focus ? 0.2 : 0 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{
            width: "1px",
            backgroundColor: "var(--icon-color)",
            flexShrink: 0,
            margin: "0 5px",
          }}
        />

        {focus && (
          <motion.button
            key="send"
            className={styles.taskSendButton}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSend();
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ delay: 0.12 }}
          >
            <SendIcon className={styles.sendIcon} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
});
