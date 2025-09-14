"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";

import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";
import { ClientOnlyPortal } from "../client-only-portal";

import styles from "./EditTaskModal.module.css";

const computeTargetY = (rectHeight: number, viewportWidth: number) => {
  if (typeof window === "undefined") return 0;
  const vv = window.visualViewport;
  const vh = vv?.height ?? window.innerHeight;
  const offsetTop = vv?.offsetTop ?? 0;
  const clamp = (n: number, min: number, max: number) =>
    Math.max(min, Math.min(n, max));
  const isMobile = viewportWidth < 850;

  if (isMobile) {
    const upperHalfHeight = vh / 2;
    const centerOfUpperHalf = offsetTop + upperHalfHeight / 2;
    const idealTop = centerOfUpperHalf - rectHeight / 2;
    const minTop = offsetTop;
    const maxTop = offsetTop + upperHalfHeight - rectHeight;
    return Math.round(clamp(idealTop, minTop, maxTop));
  } else {
    const centerFull = offsetTop + vh / 2;
    const idealTop = centerFull - rectHeight / 2;
    const minTop = offsetTop;
    const maxTop = offsetTop + vh - rectHeight;
    return Math.round(clamp(idealTop, minTop, maxTop)) - 15;
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

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  const modalTaskId = modalTask?.task_id ?? null;

  const syncedTask = useTodoDataStore((state) =>
    state.tasks.find((t) => t.task_id === modalTaskId)
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const initialAnimation = useMemo(() => {
    if (!initialRect) {
      return {
        x: windowSize.width / 2,
        y: windowSize.height / 2,
        width: 0,
        height: 0,
      };
    }

    return {
      x: initialRect.left - 15,
      y: initialRect.top - 15,
      width: initialRect.width,
    };
  }, [initialRect, windowSize]);

  const targetAnimation = useMemo(() => {
    const viewportWidth = windowSize.width;
    const preferredWidth = initialRect?.width ?? 500;
    const maxAvailable = Math.max(240, viewportWidth);
    const targetWidth = Math.min(preferredWidth, maxAvailable);

    const targetX = Math.round(viewportWidth / 2 - targetWidth / 2) - 15;

    const rectHeight = initialRect?.height ?? 0;
    const targetY = computeTargetY(rectHeight, viewportWidth);

    return {
      x: targetX,
      y: targetY,
      transition: {
        delay: 0.05,
      },
    };
  }, [initialRect, windowSize]);

  const maxHeightStyle = useMemo(() => {
    const isMobile = windowSize.width < 850;
    const viewportHeight = windowSize.height;

    if (isMobile) {
      const maxHeight = viewportHeight / 2 - 20;
      return maxHeight;
    } else {
      const maxHeight = viewportHeight / 2;
      return maxHeight;
    }
  }, [windowSize]);

  const handleAnimationComplete = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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
              }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onAnimationComplete={handleAnimationComplete}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  maxHeight: `${maxHeightStyle}px`,
                }}
              >
                {syncedTask && (
                  <TaskCard
                    task={syncedTask}
                    inputRef={inputRef}
                    maxHeight={maxHeightStyle}
                  />
                )}
              </div>
            </motion.div>
          </div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
