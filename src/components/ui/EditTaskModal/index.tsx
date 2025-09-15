"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useShallow } from "zustand/shallow";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";

import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";
import { ClientOnlyPortal } from "../ClientOnlyPortal";

import styles from "./EditTaskModal.module.css";
import { Calendar } from "../Calendar";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

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
    return Math.round(clamp(idealTop, minTop, maxTop)) + 50;
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
    closeModal,
  } = useEditTaskModalStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      task: state.task,
      initialRect: state.initialRect,
      closeModal: state.closeModal,
    }))
  );
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);

  useEffect(() => {
    setSelected(undefined);
    setHour(undefined);
    if (modalTask?.target_date) {
      const dateObject = new Date(modalTask.target_date);

      setSelected(dateObject);

      const hours = String(dateObject.getHours()).padStart(2, "0");
      const minutes = String(dateObject.getMinutes()).padStart(2, "0");
      setHour(`${hours}:${minutes}`);
    }
  }, [modalTask]);

  useEffect(() => {
    console.log(selected);
    console.log(hour);
  }, [selected, hour]);

  const contentRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  // const modalTaskId = modalTask?.task_id ?? null;

  // const syncedTask = useTodoDataStore((state) =>
  //   state.tasks.find((t) => t.task_id === modalTaskId)
  // );

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
    const targetY = computeTargetY(rectHeight + 70, viewportWidth);

    return {
      x: targetX,
      y: targetY,
      transition: {
        delay: 0.1,
      },
    };
  }, [initialRect, windowSize]);

  const maxHeightStyle = useMemo(() => {
    const isMobile = windowSize.width < 850;
    const viewportHeight = windowSize.height;

    if (isMobile) {
      const maxHeight = viewportHeight / 2 - 120;
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

  useOnClickOutside(
    contentRef,
    () => {
      closeModal();
      setSelected(undefined);
      setHour(undefined);
    },
    [toolsRef],
    "no-close-edit"
  );

  const handleFocusOnParentInput = () => {
    if (inputRef) inputRef.current?.focus();
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
                ref={contentRef}
              >
                {modalTask && (
                  <TaskCard
                    task={modalTask}
                    inputRef={inputRef}
                    maxHeight={maxHeightStyle}
                    selected={selected}
                    hour={hour}
                  />
                )}
              </div>
              <motion.div
                className={styles.moreOptions}
                initial={{
                  scale: 0,
                  opacity: 0,
                }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: {
                    duration: 0.2,
                    delay: 0.2,
                  },
                }}
                exit={{
                  scale: 0,
                  opacity: 0,
                }}
                ref={toolsRef}
              >
                <Calendar
                  selected={selected}
                  setSelected={setSelected}
                  hour={hour}
                  setHour={setHour}
                  focusToParentInput={handleFocusOnParentInput}
                />
              </motion.div>
            </motion.div>
          </div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
