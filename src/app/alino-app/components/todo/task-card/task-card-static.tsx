"use client";
import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { animate } from "motion";
import { AnimatePresence, motion } from "motion/react";
import type { Variants } from "motion/react";
import { useSortable } from "@dnd-kit/sortable";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { useUserDataStore } from "@/store/useUserDataStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import type { TaskType } from "@/lib/schemas/database.types";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { Checkbox } from "@/components/ui/Checkbox";
import { linkifyWithIcon } from "@/utils/linkify";
import { WavyStrikethrough } from "@/components/ui/WavyStrikethrough";
import {
  DeleteIcon,
  Edit,
  Note,
  SplitIcon,
  DragDropVerticalIcon,
} from "@/components/ui/icons/icons";
import { isHtmlContent } from "@/components/ui/RichTextEditor/richTextUtils";
import styles from "./task-card.module.css";
import { useModalStore } from "@/store/useModalStore";

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

const cardWrapperVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.98,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: [0.4, 0, 0.2, 1],
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.16,
      ease: "easeIn",
    },
  },
};

export const TaskCardStatic = memo(
  ({
    task,
    editionMode = false,
    home = false,
    isOverlay = false,
    isReordering = false,
    inTrash = false,
  }: {
    task: TaskType;
    editionMode?: boolean;
    home?: boolean;
    isOverlay?: boolean;
    isReordering?: boolean;
    inTrash?: boolean;
  }) => {
    const [completed, setCompleted] = useState<boolean | null>(task.completed);
    const { openModal, taskEditing } = useEditTaskModalStore(
      useShallow((state) => ({
        openModal: state.openModal,
        taskEditing: state.task,
      })),
    );
    const { list, deleteTask, updateTaskCompleted } = useTodoDataStore(
      useShallow((state) => ({
        list: state.getListById(task.list_id),
        deleteTask: state.deleteTask,
        updateTaskCompleted: state.updateTaskCompleted,
      })),
    );
    const taskSort = useTodoDataStore((state) => state.taskSort);
    const user = useUserDataStore((state) => state.user);
    const animations = useUserPreferencesStore((state) => state.animations);
    const openSplitModal = useModalStore((s) => s.open);
    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLElement>(null);

    const isVisible =
      taskEditing?.task_id === task.task_id && !editionMode ? 0 : 1;

    useEffect(() => {
      if (!cardRef.current) return;
      animate(
        cardRef.current,
        { opacity: isVisible },
        { duration: 0, delay: isVisible === 1 ? 0.3 : 0.05 },
      );
    }, [isVisible]);

    useEffect(() => {
      setCompleted(task.completed);
    }, [task.completed]);

    const handleUpdateStatus = useCallback(() => {
      const next = !completed;
      setCompleted(next);

      if (!animations) {
        updateTaskCompleted(task.task_id, next);
        return;
      }

      const estimatedLines = Math.max(
        1,
        Math.ceil((textRef.current?.offsetHeight ?? 20) / 22),
      );
      const waveDuration = estimatedLines * 100 + 200; // en ms

      setTimeout(() => {
        updateTaskCompleted(task.task_id, next);
      }, waveDuration);
    }, [completed, task.task_id, updateTaskCompleted, animations]);

    const handleEdit = useCallback(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;
      const tempTextarea = document.createElement("textarea");
      Object.assign(tempTextarea.style, {
        position: "absolute",
        opacity: "0",
        pointerEvents: "none",
        top: "-9999px",
        left: "-9999px",
      });
      document.body.appendChild(tempTextarea);
      tempTextarea.focus();
      setTimeout(() => window.scrollTo(0, 0), 300);
      openModal({
        task,
        onConfirm: () => {},
        initialRect: rect,
        tempFocusElement: tempTextarea,
      });
    }, [openModal, task]);

    const handleDelete = useCallback(() => {
      if (animations && completed) {
        setTimeout(() => deleteTask(task.task_id), 150);
      } else {
        deleteTask(task.task_id);
      }
    }, [task.task_id, deleteTask, animations, completed]);

    const handleSplit = useCallback(() => {
      const allTasks = useTodoDataStore.getState().tasks;
      const listTasks = allTasks.filter((t) => t.list_id === task.list_id);

      const sorted = [...listTasks].sort((a, b) => {
        const ra = a.rank;
        const rb = b.rank;
        if (ra && rb) return ra > rb ? -1 : ra < rb ? 1 : 0;
        if (ra && !rb) return -1;
        if (!ra && rb) return 1;
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });

      const idx = sorted.findIndex((t) => t.task_id === task.task_id);
      const prevTaskRank =
        idx >= 0 && idx < sorted.length - 1
          ? (sorted[idx + 1]?.rank ?? null)
          : null;

      openSplitModal({
        type: "splitTask",
        props: {
          taskContent: task.task_content,
          taskId: task.task_id,
          listId: task.list_id,
          taskRank: task.rank ?? null,
          prevTaskRank,
        },
      });
    }, [task, openSplitModal]);

    const canEditOrDelete = list?.role !== "reader";
    const configOptions = useMemo(
      () =>
        [
          {
            name: "Editar",
            icon: (
              <Edit
                style={{
                  width: "14px",
                  height: "auto",
                  stroke: "var(--text)",
                  strokeWidth: 2,
                }}
              />
            ),
            action: handleEdit,
            enabled: canEditOrDelete,
          },
          {
            name: "Dividir",
            icon: (
              <SplitIcon
                style={{
                  width: "14px",
                  height: "auto",
                  stroke: "var(--text)",
                  strokeWidth: 2,
                }}
              />
            ),
            action: handleSplit,
            enabled: canEditOrDelete && task.completed !== null,
          },
          {
            name: "Eliminar",
            icon: (
              <DeleteIcon
                style={{
                  stroke: "var(--text)",
                  width: "14px",
                  height: "auto",
                  strokeWidth: 2,
                }}
              />
            ),
            action: handleDelete,
            enabled: canEditOrDelete,
          },
        ].filter((o) => o.enabled),
      [handleEdit, handleSplit, handleDelete, canEditOrDelete, task.completed],
    );

    const isHtml = isHtmlContent(task.task_content);
    const displayContent = home
      ? isHtml
        ? task.task_content
        : task.task_content.slice(0, 200)
      : task.task_content;

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: task.task_id,
      disabled:
        !isReordering ||
        taskSort !== "default" ||
        editionMode ||
        home ||
        isOverlay ||
        !canEditOrDelete,
    });

    const style = useMemo<React.CSSProperties>(
      () => ({
        transform: `translate3d(${transform?.x || 0}px, ${transform?.y || 0}px, 0)`,
        transition,
        opacity: isDragging ? 0.3 : undefined,
        zIndex: isDragging ? 99 : 1,
        pointerEvents: isDragging ? "none" : "auto",
        width: "100%",
      }),
      [transform, transition, isDragging],
    );

    return (
      <div ref={setNodeRef} style={{ ...style, width: "100%" }}>
        <motion.div
          style={{ width: "100%" }}
          variants={!isOverlay ? cardWrapperVariants : undefined}
          initial={!isOverlay ? "initial" : undefined}
          animate={!isOverlay ? "animate" : undefined}
          exit={!isOverlay ? "exit" : undefined}
          layout
        >
          <motion.div
            className={styles.cardContainer}
            ref={cardRef as React.Ref<HTMLDivElement>}
            variants={animations && isOverlay ? overlayVariants : undefined}
            initial={isOverlay ? "hidden" : undefined}
            animate={isOverlay ? "visible" : undefined}
          >
            <AnimatePresence mode="wait">
              {isReordering &&
              taskSort === "default" &&
              !home &&
              !editionMode &&
              canEditOrDelete ? (
                <div className={styles.dragDropContainer}>
                  <motion.div
                    key="drag-drop-icon"
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    {...attributes}
                    {...listeners}
                    className={styles.dragDropIcon}
                  >
                    <DragDropVerticalIcon
                      style={{
                        width: "16px",
                        height: "16px",
                        stroke: "var(--text)",
                        strokeWidth: 2,
                      }}
                    />
                  </motion.div>
                </div>
              ) : (
                <motion.div
                  key="checkbox-container"
                  className={styles.checkboxContainer}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {task.completed !== null ? (
                    <Checkbox
                      status={completed}
                      handleUpdateStatus={handleUpdateStatus}
                      ariaLabel="Marcar tarea como completada"
                    />
                  ) : (
                    <Note
                      style={{
                        width: "15px",
                        stroke: "var(--icon-colorv2)",
                        strokeWidth: "2",
                        opacity: "0.2",
                      }}
                    />
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className={styles.textContainer}>
              {isHtml ? (
                <div
                  ref={textRef as React.RefObject<HTMLDivElement>}
                  className={styles.text}
                  style={{ opacity: completed ? 0.3 : 1 }}
                  dangerouslySetInnerHTML={{ __html: displayContent }}
                />
              ) : (
                <p
                  ref={textRef as React.RefObject<HTMLParagraphElement>}
                  className={styles.text}
                  style={{ opacity: completed ? 0.3 : 1 }}
                >
                  {linkifyWithIcon(displayContent)}
                </p>
              )}
              <WavyStrikethrough
                textRef={textRef as any}
                completed={completed}
              />
            </div>

            {user?.user_id !== task.created_by?.user_id && (
              <div
                style={{
                  position: "relative",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: 0.2,
                }}
              >
                <div
                  style={{
                    width: "25px",
                    height: "25px",
                    backgroundImage: `url(${task.created_by?.avatar_url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    borderRadius: "50%",
                  }}
                />
              </div>
            )}

            <div className={styles.editingButtons}>
              <TimeLimitBox
                target_date={task.target_date}
                idScrollArea="task-section-scroll-area"
                completed={completed}
              />
              <ConfigMenu
                iconWidth="25px"
                configOptions={configOptions}
                idScrollArea="task-section-scroll-area"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    );
  },
);
