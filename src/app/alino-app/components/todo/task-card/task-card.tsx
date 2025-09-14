"use client";

import {
  useState,
  useRef,
  useEffect,
  memo,
  useCallback,
  RefObject,
} from "react";
import { useShallow } from "zustand/shallow";
import { debounce } from "lodash-es";

import { useTodoDataStore } from "@/store/useTodoDataStore";
import { useEditTaskModalStore } from "@/store/useEditTaskModalStore";
import { useLineCalculator } from "@/hooks/useLineCalculator";
//import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import type { TaskType } from "@/lib/schemas/todo-schema";

import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { WavyStrikethrough } from "@/components/ui/WavyStrikethrough";
import { linkifyWithIcon } from "@/components/utils/linkify";

import { Check, MoreVertical, Note } from "@/components/ui/icons/icons";
import styles from "./task-card.module.css";
import { useUserDataStore } from "@/store/useUserDataStore";
import { ItemTypeSelector } from "./parts/ItemTypeDropdown";

export const TaskCard = memo(
  ({
    task,
    inputRef,
    maxHeight,
  }: {
    task: TaskType;
    inputRef: RefObject<HTMLTextAreaElement>;
    maxHeight: number | null;
  }) => {
    const [completed, setCompleted] = useState<boolean | null>(task.completed);
    const [inputName, setInputName] = useState<string>(task.task_content);
    const [editing, setEditing] = useState<boolean>(true);

    const closeModal = useEditTaskModalStore((state) => state.closeModal);

    const textRef = useRef<HTMLParagraphElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const checkButtonRef = useRef<HTMLButtonElement>(null);

    //const animations = useUserPreferencesStore((store) => store.animations);
    const { updateTaskName } = useTodoDataStore(
      useShallow((state) => ({
        updateTaskName: state.updateTaskName,
      }))
    );

    const user = useUserDataStore((state) => state.user);

    const { lines, calculateLines } = useLineCalculator(textRef);

    useEffect(() => {
      setCompleted(task.completed);
      setInputName(task.task_content);
    }, [task.completed, task.task_content]);

    const handleSaveName = useCallback(async () => {
      setEditing(false);
      closeModal();

      const formatText = inputName
        .replace(/\r\n/g, "\n")
        .replace(/ {2,}/g, " ")
        .replace(/\n{3,}/g, "\n\n")
        .replace(/^[ ]+|[ ]+$/g, "");

      if (
        (task.task_content === formatText && completed === task.completed) ||
        formatText.length < 1
      ) {
        setInputName(task.task_content);
        return;
      }

      setInputName(formatText);

      const { error } = await updateTaskName(
        task.task_id,
        formatText,
        completed
      );
      if (error) setInputName(task.task_content);
    }, [inputName, completed, task.task_content, task.task_id, updateTaskName]);

    useEffect(() => {
      calculateLines();
      const debouncedCalculateLines = debounce(calculateLines, 150);

      let ro: ResizeObserver | null = null;
      if (textRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => debouncedCalculateLines());
        ro.observe(textRef.current);
      }

      window.addEventListener("resize", debouncedCalculateLines);

      return () => {
        debouncedCalculateLines.cancel();
        window.removeEventListener("resize", debouncedCalculateLines);
        if (ro && textRef.current) ro.unobserve(textRef.current);
      };
    }, [calculateLines, editing, task.task_content]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent | TouchEvent) => {
        const dropdownComponent = document.getElementById("dropdown-component");
        const calendarComponent = document.getElementById("calendar-component");

        if (
          inputRef.current &&
          !inputRef.current.contains(event.target as Node) &&
          checkButtonRef.current &&
          !checkButtonRef.current.contains(event.target as Node) &&
          cardRef.current &&
          !cardRef.current.contains(event.target as Node) &&
          !dropdownComponent &&
          !calendarComponent
        ) {
          setEditing(false);
          setInputName(task.task_content);
          setCompleted(task.completed);
          closeModal();
        }
      };

      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [editing, task.task_content]);

    useEffect(() => {
      if (inputRef.current) {
        const length = inputRef.current.value.length;
        inputRef.current.setSelectionRange(length, length);
      }
    }, [editing]);

    function autoResize(textarea: any) {
      textarea.style.height = "auto";
      textarea.style.height = textarea.scrollHeight + "px";
    }

    useEffect(() => {
      if (!inputRef.current) return;
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = inputRef.current.scrollHeight + "px";
    }, [editing]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!inputRef.current) return;
        if (e.key === "Tab") {
          e.preventDefault();
          const el = e.currentTarget as HTMLTextAreaElement;
          const start = el.selectionStart;
          const end = el.selectionEnd;
          const value = el.value;
          const newValue =
            value.substring(0, start) + "\t" + value.substring(end);
          setInputName(newValue);
          requestAnimationFrame(() => {
            el.selectionStart = el.selectionEnd = start + 1;
          });
          return;
        }
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          handleSaveName();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setEditing(false);
          setInputName(task.task_content);
        }
      },
      [handleSaveName, setInputName]
    );

    useEffect(() => {
      if (!editing || !inputRef.current) return;
      const textarea = inputRef.current;
      const length = textarea.value.length;

      textarea.setSelectionRange(length, length);
      textarea.scrollTop = textarea.scrollHeight;
    }, [editing]);

    return (
      <div
        className={styles.cardContainer}
        ref={cardRef}
        style={{
          paddingLeft: editing ? "10px" : "15px",
          maxHeight: maxHeight ? `${maxHeight}px` : "initial",
        }}
      >
        <div className={styles.checkboxContainer}>
          {!editing ? (
            task.completed !== null ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  overflow: "visible",
                  fill: task.completed ? "var(--icon-colorv2)" : "transparent",
                  transition: "fill 0.1s ease-in-out",
                  transform: "scale(1)",
                }}
              >
                <path d="M12,2.5c-7.6,0-9.5,1.9-9.5,9.5s1.9,9.5,9.5,9.5s9.5-1.9,9.5-9.5S19.6,2.5,12,2.5z" />
                <path
                  style={{
                    stroke: "var(--icon-color-inside)",
                    strokeWidth: 2,
                    opacity: task.completed ? "1" : "0",
                  }}
                  strokeLinejoin="round"
                  d="m6.68,13.58s1.18,0,2.76,2.76c0,0,3.99-7.22,7.88-8.67"
                />
              </svg>
            ) : (
              <Note
                style={{
                  width: "15px",
                  stroke: "var(--icon-colorv2)",
                  strokeWidth: "2",
                  opacity: "0.2",
                }}
              />
            )
          ) : (
            <ItemTypeSelector
              completed={completed}
              setCompleted={setCompleted}
              inputRef={inputRef}
            />
          )}
        </div>
        <div className={styles.textContainer}>
          {editing ? (
            <textarea
              ref={inputRef}
              maxLength={1000}
              rows={1}
              className={styles.nameChangerInput}
              style={{
                maxHeight: maxHeight ? `${maxHeight - 20}px` : "initial",
              }}
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
              }}
              onInput={(e) => autoResize(e.target)}
              onKeyDown={handleKeyDown}
              id="task-card-edit-textarea"
            />
          ) : (
            <>
              <p
                ref={textRef}
                className={styles.text}
                style={{
                  opacity: completed ? 0.3 : 1,
                }}
              >
                {linkifyWithIcon(inputName)}
              </p>
              <WavyStrikethrough textRef={textRef} completed={completed} />
            </>
          )}
        </div>
        {user?.user_id !== task.created_by?.user_id && (
          <div
            style={{
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
          {editing ? (
            <button
              onClick={(e) => {
                e.preventDefault();
                handleSaveName();
              }}
              className={styles.checkButton}
              ref={checkButtonRef}
            >
              <Check
                style={{
                  width: "100%",
                  height: "auto",
                  stroke: "var(--icon-color)",
                  strokeWidth: 2,
                }}
              />
            </button>
          ) : (
            <button
              className={styles.mainButton}
              style={{
                width: "25px",
                height: "25px",
                backgroundColor: "var(--background-over-container)",
              }}
            >
              <MoreVertical
                style={{
                  stroke: "var(--text)",
                  width: "20px",
                  strokeWidth: "3",
                  display: "flex",
                }}
              />
            </button>
          )}
        </div>
      </div>
    );
  }
);
