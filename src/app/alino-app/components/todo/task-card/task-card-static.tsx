"use client";

import { useState, useRef, useEffect, memo, useCallback, useMemo } from "react";
import { useShallow } from "zustand/shallow";
import { animate } from "motion";

import { useUserDataStore } from "@/store/useUserDataStore";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import type { TaskType } from "@/lib/schemas/todo-schema";

import { ConfigMenu } from "@/components/ui/config-menu";
import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { Checkbox } from "@/components/ui/Checkbox";
import { linkifyWithIcon } from "@/components/utils/linkify";
import { WavyStrikethrough } from "@/components/ui/WavyStrikethrough";

import { DeleteIcon, Edit, Note } from "@/components/ui/icons/icons";
import styles from "./task-card.module.css";

export const TaskCardStatic = memo(
  ({
    task,
    editionMode = false,
  }: {
    task: TaskType;
    editionMode?: boolean;
  }) => {
    const [completed, setCompleted] = useState<boolean | null>(task.completed);

    const { openModal, taskEditing } = useEditTaskModalStore(
      useShallow((state) => ({
        openModal: state.openModal,
        taskEditing: state.task,
      }))
    );
    const { list, deleteTask, updateTaskCompleted } = useTodoDataStore(
      useShallow((state) => ({
        list: state.getListById(task.list_id),
        deleteTask: state.deleteTask,
        updateTaskCompleted: state.updateTaskCompleted,
      }))
    );

    const user = useUserDataStore((state) => state.user);

    const cardRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLParagraphElement>(null);

    const isVisible =
      taskEditing?.task_id === task.task_id && !editionMode ? 0 : 1;

    useEffect(() => {
      if (!cardRef.current) return;

      animate(
        cardRef.current,
        { opacity: isVisible },
        {
          duration: 0,
          delay: isVisible === 1 ? 0.3 : 0.02,
        }
      );
    }, [isVisible]);

    useEffect(() => {
      setCompleted(task.completed);
    }, [task.completed]);

    const handleUpdateStatus = useCallback(() => {
      const newCompleted = !completed;
      setCompleted(newCompleted);
      updateTaskCompleted(task.task_id, newCompleted);
    }, [completed, task.task_id, updateTaskCompleted]);

    const handleEdit = useCallback(() => {
      const rect = cardRef.current?.getBoundingClientRect();
      if (!rect) return;

      const tempTextarea = document.createElement("textarea");
      tempTextarea.style.position = "absolute";
      tempTextarea.style.opacity = "0";
      tempTextarea.style.pointerEvents = "none";
      tempTextarea.style.top = "-9999px";
      tempTextarea.style.left = "-9999px";
      document.body.appendChild(tempTextarea);
      tempTextarea.focus();
      setTimeout(() => window.scrollTo(0, 0), 300);

      openModal({
        task: task,
        onConfirm: () => {},
        initialRect: rect,
        tempFocusElement: tempTextarea,
      });
    }, [openModal, task]);

    const handleDelete = useCallback(
      () => deleteTask(task.task_id),
      [task.task_id, deleteTask]
    );

    const canEditOrDelete = list?.role !== "reader";

    const configOptions = useMemo(() => {
      const baseOptions = [
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
      ];
      return baseOptions.filter((option) => option.enabled);
    }, [handleEdit, handleDelete]);

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
          {/* <MarkdownText content={task.task_content} /> */}
          <p
            ref={textRef}
            className={styles.text}
            style={{
              opacity: completed ? 0.3 : 1,
            }}
          >
            {linkifyWithIcon(task.task_content)}
          </p>
          <WavyStrikethrough textRef={textRef} completed={completed} />
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
                backgroundRepeat: "no-repeat",
                borderRadius: "50%",
              }}
            ></div>
          </div>
        )}
        <div className={styles.editingButtons}>
          <TimeLimitBox
            target_date={task.target_date}
            idScrollArea={"task-section-scroll-area"}
            completed={completed}
          />
          <ConfigMenu
            iconWidth={"25px"}
            configOptions={configOptions}
            idScrollArea={"task-section-scroll-area"}
          />
        </div>
      </div>
    );
  }
);
