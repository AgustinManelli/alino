"use client";

import { useRef } from "react";
import { AnimatePresence, motion } from "motion/react";

import { useOnClickOutside } from "@/hooks/useOnClickOutside";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";

import styles from "./EditTaskModal.module.css";
import ClientOnlyPortal from "../client-only-portal";
import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";

export function EditTaskModal() {
  const ref = useRef<HTMLDivElement>(null);

  const { isOpen, task, onConfirm, closeModal } = useEditTaskModalStore();

  const handleAccept = () => {
    onConfirm();
    closeModal();
  };

  useOnClickOutside(ref, () => {
    if (isOpen) {
      closeModal();
    }
  });

  return (
    <AnimatePresence>
      <ClientOnlyPortal>
        {isOpen && (
          <motion.div className={styles.backgroundContainer}>
            <div className={styles.task} ref={ref}>
              <TaskCard
                task={{
                  completed: false,
                  created_at: "",
                  description: "",
                  index: 1,
                  list_id: "1",
                  target_date: "",
                  task_content: "hola",
                  task_id: "",
                  updated_at: "",
                  created_by: {
                    user_id: "",
                    display_name: "yo",
                    username: "yo",
                    avatar_url: "",
                  },
                }}
              />
            </div>
          </motion.div>
        )}
      </ClientOnlyPortal>
    </AnimatePresence>
  );
}
