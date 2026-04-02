"use client";
import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { animate } from "motion";
import { useUserStore } from "@/components/providers/UserStoreProvider";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import type { TaskType } from "@/lib/schemas/database.types";
import { ConfigMenu } from "@/components/ui/ConfigMenu";
import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { Checkbox } from "@/components/ui/Checkbox";
import { linkifyWithIcon } from "@/utils/linkify";
import { WavyStrikethrough } from "@/components/ui/WavyStrikethrough";
import { DeleteIcon, Edit, Note } from "@/components/ui/icons/icons";
import { isHtmlContent } from "@/components/ui/RichTextEditor/richTextUtils";
import styles from "./task-card.module.css";

export const TaskCardStatic = memo(
  ({
    task,
    editionMode = false,
    home = false,
  }: {
    task: TaskType;
    editionMode?: boolean;
    home?: boolean;
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
    const user = useUserStore((state) => state.user);
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
      updateTaskCompleted(task.task_id, next);
    }, [completed, task.task_id, updateTaskCompleted]);

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

    const handleDelete = useCallback(
      () => deleteTask(task.task_id),
      [task.task_id, deleteTask],
    );

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
      [handleEdit, handleDelete],
    );

    const isHtml = isHtmlContent(task.task_content);
    const displayContent = home
      ? isHtml
        ? task.task_content
        : task.task_content.slice(0, 200)
      : task.task_content;

    return (
      <div className={styles.cardContainer} ref={cardRef}>
        <div className={styles.checkboxContainer}>
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
        </div>

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
          <WavyStrikethrough textRef={textRef as any} completed={completed} />
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
      </div>
    );
  },
);
