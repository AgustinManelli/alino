"use client";

import type { Database } from "@/lib/schemas/todo-schema";
import { motion } from "framer-motion";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useRef, useEffect } from "react";
import { DeleteIcon } from "@/components/ui/icons/icons";
import { useTodoDataStore } from "@/store/useTodoDataStore";
import { usePlatformInfoStore } from "@/store/usePlatformInfoStore";
import styles from "./task-card.module.css";

type TaskType = Database["public"]["Tables"]["tasks"]["Row"];

export function TaskCard({ task }: { task: TaskType }) {
  const [completed, setCompleted] = useState<boolean>(task.completed);
  const [hover, setHover] = useState<boolean>(false);
  const [lines, setLines] = useState<
    { width: number; top: number; left: number }[]
  >([]);
  const textRef = useRef<HTMLParagraphElement>(null);

  const deleteTask = useTodoDataStore((state) => state.deleteTask);
  const updateTaskCompleted = useTodoDataStore(
    (status) => status.updateTaskCompleted
  );
  const { isMobile } = usePlatformInfoStore();

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
            top: rect.top - containerRect.top + rect.height / 2,
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
  }, []); // Recalcular cuando cambie el texto

  const handleDelete = () => {
    deleteTask(task.id);
  };

  const handleUpdateStatus = () => {
    setCompleted(!completed);
    updateTaskCompleted(task.id, !completed);
  };

  return (
    <div
      className={styles.cardContainer}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className={styles.leftContainer}>
        <Checkbox
          status={completed}
          handleUpdateStatus={handleUpdateStatus}
          id={task.id}
        />
        <div style={{ position: "relative" }}>
          <p
            ref={textRef}
            className={styles.text}
            style={{ opacity: completed ? 0.3 : 1 }}
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
                height="2"
                viewBox={`0 0 ${line.width} 2`}
                style={{ display: "block" }}
              >
                <motion.line
                  x1="0"
                  y1="1"
                  x2={line.width}
                  y2="1"
                  stroke="#1c1c1c"
                  strokeWidth="2"
                  // strokeLinecap="round"
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
        </div>
      </div>
      <button
        className={styles.deleteButton}
        style={{ opacity: hover || isMobile ? "1" : "0" }}
        onClick={handleDelete}
      >
        <DeleteIcon
          style={{ stroke: "#1c1c1c", width: "15px", strokeWidth: "2" }}
        />
      </button>
    </div>
  );
}
