"use client";

import { useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";

import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";
import { ClientOnlyPortal } from "../client-only-portal";

import styles from "./EditTaskModal.module.css";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

const computeTargetY = (rectHeight: number, viewportWidth: number) => {
  if (typeof window !== "undefined") {
    const vv = window.visualViewport;
    const vh = vv?.height ?? window.innerHeight;
    const offsetTop = vv?.offsetTop ?? 0;

    const clamp = (n: number, min: number, max: number) =>
      Math.max(min, Math.min(n, max));

    const isMobile = viewportWidth < 850;

    if (isMobile) {
      const upperTop = offsetTop;
      const upperHeight = vh / 2;

      const centerUpper = upperTop + upperHeight / 2;

      const idealTop = centerUpper - rectHeight / 2;

      const minTop = upperTop;
      const maxTop = upperTop + upperHeight - rectHeight;

      return Math.round(clamp(idealTop, minTop, maxTop));
    } else {
      const centerFull = offsetTop + vh / 2;
      const idealTop = centerFull - rectHeight / 2;

      const minTop = offsetTop;
      const maxTop = offsetTop + vh - rectHeight;
      return Math.round(clamp(idealTop, minTop, maxTop));
    }
  }
};

export const EditTaskModal = () => {
  const {
    isOpen,
    task: modalTask,
    initialRect,
  } = useEditTaskModalStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      task: state.task,
      initialRect: state.initialRect,
    }))
  );

  const inputRef = useRef<HTMLTextAreaElement>(null);

  const modalTaskId = modalTask?.task_id ?? null;

  const syncedTask = useTodoDataStore((state) =>
    state.tasks.find((t) => t.task_id === modalTaskId)
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const initialAnimation = useMemo(() => {
    if (!initialRect) {
      return {
        x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
        y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
        width: 0,
        height: 0,
      };
    }

    return {
      x: initialRect.left - 15,
      y: initialRect.top - 15,
      width: initialRect.width,
    };
  }, [initialRect]);

  const targetAnimation = useMemo(() => {
    const viewportWidth =
      typeof window !== "undefined" ? window.innerWidth : 1024;

    const preferredWidth = initialRect?.width ?? 500;
    const MARGIN = 0;
    const MOBILE_BREAKPOINT = 850;
    const maxAvailable = Math.max(240, viewportWidth - MARGIN * 2);

    const targetWidth =
      viewportWidth < MOBILE_BREAKPOINT
        ? Math.min(preferredWidth, maxAvailable)
        : Math.min(Math.min(preferredWidth, 500), maxAvailable);

    const centeredX = Math.round(viewportWidth / 2 - targetWidth / 2);
    const minX = MARGIN;
    const maxX = Math.max(MARGIN, viewportWidth - targetWidth - MARGIN);
    const targetX =
      viewportWidth < MOBILE_BREAKPOINT
        ? minX
        : Math.min(Math.max(centeredX, minX), maxX);

    const rectHeight = initialRect?.height ?? 0;

    const targetY = computeTargetY(rectHeight, viewportWidth);

    return {
      x: targetX,
      y: targetY,
      // width: Math.round(targetWidth),
      transition: {
        delay: 0.05,
      },
    };
  }, [initialRect]);

  const handleAnimationComplete = () => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <ClientOnlyPortal>
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(5px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
          />
          <div className={styles.modalContainerLimit}>
            <motion.div
              className={styles.modalContainer}
              initial={initialAnimation}
              animate={targetAnimation}
              exit={{
                x: initialAnimation.x,
                y: initialAnimation.y,
                width: initialAnimation.width,
                height: initialAnimation.height,
                // transition: { delay: 0.3 },
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onAnimationComplete={handleAnimationComplete}
              layout
            >
              {syncedTask && <TaskCard task={syncedTask} inputRef={inputRef} />}
            </motion.div>
          </div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
