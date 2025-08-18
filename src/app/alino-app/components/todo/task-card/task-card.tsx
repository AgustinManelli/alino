"use client";

import type { Database } from "@/lib/schemas/todo-schema";
import { motion } from "motion/react";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect, useMemo } from "react";
import {
  Check,
  DeleteIcon,
  Edit,
  Information,
} from "@/components/ui/icons/icons";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-card.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { ConfigMenu } from "@/components/ui/config-menu";
import { TimeLimitBox } from "@/components/ui/time-limit-box";

type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];
type UserProfile = Pick<
  Database["public"]["Tables"]["users"]["Row"],
  "user_id" | "display_name" | "username" | "avatar_url"
>;
type TaskType = Omit<TaskRow, "created_by"> & {
  created_by: UserProfile | null;
};

export function TaskCard({ task }: { task: TaskType }) {
  const [completed, setCompleted] = useState<boolean>(task.completed);
  const [editing, setEditing] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(task.task_content);
  const [lines, setLines] = useState<
    { width: number; top: number; left: number }[]
  >([]);
  const textRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const checkButtonRef = useRef<HTMLButtonElement>(null);

  const animations = useUserPreferencesStore((store) => store.animations);
  const user = useTodoDataStore((state) => state.user);

  const list = useTodoDataStore((state) => state.getListById(task.list_id));
  const updateTaskName = useTodoDataStore((state) => state.updateTaskName);

  const deleteTask = useTodoDataStore((state) => state.deleteTask);
  const updateTaskCompleted = useTodoDataStore(
    (status) => status.updateTaskCompleted
  );

  useEffect(() => {
    const calculateLines = () => {
      if (!textRef.current) return;

      const range = document.createRange();
      const textNodes: Node[] = [];

      function findTextNodes(node: Node) {
        if (node.nodeType === Node.TEXT_NODE) {
          textNodes.push(node);
        } else {
          node.childNodes.forEach(findTextNodes);
        }
      }

      findTextNodes(textRef.current);

      const newLines: { width: number; top: number; left: number }[] = [];
      const containerRect = textRef.current.getBoundingClientRect();

      textNodes.forEach((textNode) => {
        range.selectNodeContents(textNode);
        const rects = Array.from(range.getClientRects());

        rects.forEach((rect) => {
          newLines.push({
            width: rect.width,
            top: rect.top - containerRect.top + rect.height / 2 - 2,
            left: rect.left - containerRect.left,
          });
        });
      });

      setLines(newLines);
    };

    calculateLines();
    window.addEventListener("resize", calculateLines);

    return () => {
      window.removeEventListener("resize", calculateLines);
    };
  }, [task]);

  const generateWavePath = (width: number) => {
    const waveSegments = Math.max(4, Math.floor(width / 20));
    const step = width / waveSegments;

    return `
      M 0 3
      ${Array.from({ length: waveSegments }, (_, i) => {
        const x1 = step * (i + 0.5);
        const y1 = i % 2 === 0 ? 0 : 6;
        const x2 = step * (i + 1);
        return `Q ${x1} ${y1}, ${x2} 3`;
      }).join(" ")}
    `;
  };

  const handleDelete = () => {
    deleteTask(task.task_id);
  };

  const handleUpdateStatus = () => {
    setCompleted(!completed);
    updateTaskCompleted(task.task_id, !completed);
  };

  const handleSaveName = async () => {
    const formatText = inputName
      .trim()
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n");
    if (task.task_content === inputName || completed || formatText.length < 1) {
      setEditing(false);
      setInputName(task.task_content);
      return;
    }

    setEditing(false);
    setInputName(formatText);

    const { error } = await updateTaskName(task.task_id, formatText);

    if (error) {
      setInputName(task.task_content);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node) &&
        // &&
        // cardRef.current &&
        // !cardRef.current.contains(event.target as Node)
        checkButtonRef.current &&
        !checkButtonRef.current.contains(event.target as Node)
      ) {
        setEditing(false);
        setInputName(task.task_content);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (inputRef.current) {
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
      inputRef.current.focus();
    }
    // inputRef.current?.focus();
  }, [editing]);

  const handleEdit = () => {
    setEditing(true);
  };

  function autoResize(textarea: any) {
    textarea.style.height = "auto";
    textarea.style.height = textarea.scrollHeight + "px";
  }

  useEffect(() => {
    if (!inputRef.current) return;
    inputRef.current.style.height = "auto";
    inputRef.current.style.height = inputRef.current.scrollHeight + "px";
  }, [editing]);

  const canEditOrDelete = list?.role !== "reader";
  const baseConfigOptions = [
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
    },
    {
      name: "Información",
      icon: (
        <Information
          style={{
            stroke: "var(--text)",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: () => {},
    },
  ];
  const configOptions = baseConfigOptions.filter((option) => {
    if (option.name !== "Editar" && option.name !== "Eliminar") {
      return true;
    }
    return canEditOrDelete;
  });

  const filteredOptions = completed ? configOptions.slice(1) : configOptions;

  return (
    <div className={styles.cardContainer} ref={cardRef}>
      <div className={styles.checkboxContainer}>
        <Checkbox
          status={completed}
          handleUpdateStatus={handleUpdateStatus}
          id={task.task_id}
          active={editing ? true : false}
        />
      </div>
      <div className={styles.textContainer} style={{ position: "relative" }}>
        {editing ? (
          <motion.textarea
            rows={1}
            maxLength={200}
            initial={{
              backgroundColor: "var(--background-over-container)",
            }}
            animate={{
              backgroundColor: "var(--background-over-container)",
            }}
            transition={{
              backgroundColor: {
                duration: 0.3,
              },
            }}
            className={styles.nameChangerInput}
            value={inputName}
            ref={inputRef}
            onInput={(e) => autoResize(e.target)}
            onChange={(e) => {
              setInputName(e.target.value);
            }}
            onKeyDown={(e) => {
              if (!inputRef.current) return;
              if (e.key === "Enter" && !e.shiftKey) {
                handleSaveName();
              }
              if (e.key === "Escape") {
                setEditing(false);
                setInputName(task.task_content);
              }
            }}
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
              {task.task_content}
            </p>
            {lines.map((line, index) => (
              <motion.div
                key={index}
                style={{
                  position: "absolute",
                  pointerEvents: "none",
                  top: line.top,
                  left: line.left - 10,
                  width: line.width + 20,
                }}
              >
                <motion.svg
                  width="100%"
                  height="6"
                  viewBox={`0 0 ${line.width + 15} 6`}
                  style={{ display: "block" }}
                >
                  <motion.path
                    d={generateWavePath(line.width + 15)}
                    stroke="var(--text)"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: completed ? 1 : 0 }}
                    transition={{
                      duration: 0.2,
                      delay: completed
                        ? index * 0.1
                        : (lines.length - index - 1) * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                </motion.svg>
              </motion.div>
            ))}
          </>
        )}
      </div>
      {user?.user_id !== task.created_by?.user_id && (
        <div
          style={{
            width: "25px",
            height: "100%",
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
          <ConfigMenu
            iconWidth={"25px"}
            configOptions={filteredOptions}
            idScrollArea={"task-section-scroll-area"}
          />
        )}
      </div>
    </div>
  );
}
