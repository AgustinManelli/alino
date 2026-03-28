"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Editor } from "@tiptap/react";
import { useShallow } from "zustand/shallow";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import { TaskCard } from "@/app/alino-app/components/todo/task-card/task-card";
import { ClientOnlyPortal } from "../ClientOnlyPortal";
import { Calendar } from "../Calendar";
import { RichTextToolbar } from "../RichTextEditor/RichTextToolbar";
import { AIEnhanceButton } from "../AIEnhanceButton/AIEnhanceButton";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";
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
    return (
      Math.round(
        clamp(idealTop, offsetTop, offsetTop + upperHalfHeight - rectHeight),
      ) + 50
    );
  } else {
    const centerFull = offsetTop + vh / 2;
    const idealTop = centerFull - rectHeight / 2;
    return (
      Math.round(clamp(idealTop, offsetTop, offsetTop + vh - rectHeight)) - 15
    );
  }
};

export const EditTaskModal = () => {
  const {
    isOpen,
    task: modalTask,
    initialRect,
    closeModal,
    setAnimating,
  } = useEditTaskModalStore(
    useShallow((state) => ({
      isOpen: state.isOpen,
      task: state.task,
      initialRect: state.initialRect,
      closeModal: state.closeModal,
      setAnimating: state.setAnimating,
    })),
  );

  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [taskEditor, setTaskEditor] = useState<Editor | null>(null);

  useEffect(() => {
    setSelected(undefined);
    setHour(undefined);
    setTaskEditor(null);
    if (modalTask?.target_date) {
      const d = new Date(modalTask.target_date);
      setSelected(d);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      setHour(`${hh}:${mm}`);
    }
  }, [modalTask]);

  const contentRef = useRef<HTMLDivElement>(null);
  const toolsRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handle = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handle();
    window.addEventListener("resize", handle);
    return () => window.removeEventListener("resize", handle);
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
    const vw = windowSize.width;
    const preferredWidth = initialRect?.width ?? 500;
    const targetWidth = Math.min(preferredWidth, Math.max(240, vw));
    const targetX = Math.round(vw / 2 - targetWidth / 2) - 15;
    const targetY = computeTargetY((initialRect?.height ?? 0) + 70, vw);
    return { x: targetX, y: targetY, transition: { delay: 0.1 } };
  }, [initialRect, windowSize]);

  const maxHeightStyle = useMemo(() => {
    const isMobile = windowSize.width < 850;
    return isMobile ? windowSize.height / 2 - 120 : windowSize.height / 2;
  }, [windowSize]);

  const handleAnimationComplete = useCallback(() => {
    if (isOpen) {
      setAnimating(false);
      taskEditor?.commands.focus("end");
    }
  }, [isOpen, taskEditor, setAnimating]);

  useOnClickOutside(
    contentRef,
    () => {
      closeModal();
      setSelected(undefined);
      setHour(undefined);
    },
    [toolsRef, toolbarRef],
    "no-close-edit",
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <ClientOnlyPortal>
          <motion.div
            className={styles.modalBackdrop}
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3 }}
          />

          <div className={styles.modalContainerLimit}>
            <motion.div
              className={styles.modalContainer}
              initial={initialAnimation}
              animate={targetAnimation}
              exit={{ x: initialAnimation.x, y: initialAnimation.y }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onAnimationComplete={handleAnimationComplete}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  overflow: "hidden",
                  maxHeight: `${maxHeightStyle}px`,
                }}
                ref={contentRef}
              >
                {modalTask && (
                  <TaskCard
                    task={modalTask}
                    onEditorReady={setTaskEditor}
                    maxHeight={maxHeightStyle}
                    selected={selected}
                    setSelected={setSelected}
                    hour={hour}
                    setHour={setHour}
                  />
                )}
              </div>

              <motion.div
                ref={toolbarRef}
                className={styles.toolbarContainer}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.2, delay: 0.15 },
                }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <RichTextToolbar editor={taskEditor} visible={!!taskEditor} />
              </motion.div>

              <motion.div
                className={styles.moreOptions}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: 1,
                  opacity: 1,
                  transition: { duration: 0.2, delay: 0.2 },
                }}
                exit={{ scale: 0, opacity: 0 }}
                ref={toolsRef}
              >
                <Calendar
                  selected={selected}
                  setSelected={setSelected}
                  hour={hour}
                  setHour={setHour}
                  focusToParentInput={() => taskEditor?.commands.focus()}
                />
                <AIEnhanceButton
                  editor={taskEditor}
                  visible={!!taskEditor}
                  showGenerateTasks={false}
                />
              </motion.div>
            </motion.div>
          </div>
        </ClientOnlyPortal>
      )}
    </AnimatePresence>
  );
};
