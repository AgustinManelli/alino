"use client";

import type { Database } from "@/lib/schemas/todo-schema";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect } from "react";
import { Check, DeleteIcon, Edit } from "@/components/ui/icons/icons";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import styles from "./task-card.module.css";
import { useUserPreferencesStore } from "@/store/useUserPreferencesStore";
import { ConfigMenu } from "@/components/ui/config-menu";
import { TimeLimitBox } from "@/components/ui/time-limit-box";

type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskCard({ task }: { task: TaskType }) {
  const [completed, setCompleted] = useState<boolean>(task.completed);
  const [editing, setEditing] = useState<boolean>(false);
  const [inputName, setInputName] = useState<string>(task.name);
  const [lines, setLines] = useState<
    { width: number; top: number; left: number }[]
  >([]);
  const textRef = useRef<HTMLParagraphElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const animations = useUserPreferencesStore((store) => store.animations);
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
    deleteTask(task.id);
  };

  const handleUpdateStatus = () => {
    setCompleted(!completed);
    updateTaskCompleted(task.id, !completed);
  };

  const handleSaveName = async () => {
    if (task.name === inputName || completed) {
      setEditing(false);
      setInputName(task.name);
      return;
    }

    setEditing(false);

    const { error } = await updateTaskName(task.id, inputName);

    if (error) {
      setInputName(task.name);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
        // &&
        // cardRef.current &&
        // !cardRef.current.contains(event.target as Node)
      ) {
        setEditing(false);
        setInputName(task.name);
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

  const configOptions = [
    {
      name: "Editar",
      icon: (
        <Edit
          style={{
            width: "14px",
            height: "auto",
            stroke: "#1c1c1c",
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
            stroke: "#1c1c1c",
            width: "14px",
            height: "auto",
            strokeWidth: 2,
          }}
        />
      ),
      action: handleDelete,
    },
  ];

  const filteredOptions = completed ? configOptions.slice(1) : configOptions;

  return (
    <div className={styles.cardContainer} ref={cardRef}>
      <div className={styles.checkboxContainer}>
        <Checkbox
          status={completed}
          handleUpdateStatus={handleUpdateStatus}
          id={task.id}
          active={editing ? true : false}
        />
      </div>
      <div className={styles.textContainer} style={{ position: "relative" }}>
        {editing ? (
          <motion.textarea
            rows={1}
            maxLength={200}
            initial={animations ? { backgroundColor: "#00000000" } : undefined}
            animate={animations ? { backgroundColor: "#0000000d" } : undefined}
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
              if (e.key === "Enter") {
                handleSaveName();
              }
              if (e.key === "Escape") {
                setEditing(false);
                setInputName(task.name);
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
                backgroundColor: editing ? "rgb(240, 240, 240)" : "trasnparent",
              }}
            >
              {task.name}
            </p>
            {lines.map((line, index) => (
              <motion.div
                key={index}
                style={{
                  position: "absolute",
                  pointerEvents: "none",
                  top: line.top,
                  left: line.left,
                  width: line.width,
                }}
              >
                <motion.svg
                  width="100%"
                  height="6"
                  viewBox={`0 0 ${line.width} 6`}
                  style={{ display: "block" }}
                >
                  <motion.path
                    d={generateWavePath(line.width)}
                    stroke="#1c1c1c"
                    strokeWidth="2"
                    fill="none"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: completed ? 1 : 0 }}
                    transition={{
                      duration: 0.2,
                      delay: index * 0.1,
                      ease: "easeInOut",
                    }}
                  />
                </motion.svg>
              </motion.div>
            ))}
          </>
        )}
      </div>
      <div className={styles.editingButtons}>
        <TimeLimitBox
          target_date={task.target_date}
          idScrollArea={"task-section-scroll-area"}
        />
        {editing ? (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSaveName();
            }}
            className={styles.checkButton}
          >
            <Check
              style={{
                width: "100%",
                height: "auto",
                stroke: "#1c1c1c",
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
