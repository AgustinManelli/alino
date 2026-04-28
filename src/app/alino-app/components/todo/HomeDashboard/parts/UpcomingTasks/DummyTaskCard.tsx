"use client";

import React, { useRef } from "react";
import { TaskType } from "@/lib/schemas/database.types";
import { Checkbox } from "@/components/ui/Checkbox";
import { TimeLimitBox } from "@/components/ui/time-limit-box";
import { ArrowLeft, Note } from "@/components/ui/icons/icons";
import { WavyStrikethrough } from "@/components/ui/WavyStrikethrough";
import { linkifyWithIcon } from "@/utils/linkify";
import { isHtmlContent } from "@/components/ui/RichTextEditor/richTextUtils";
import styles from "../../../TaskCard/TaskCard.module.css";

export const DummyTaskCard = ({ task }: { task: TaskType }) => {
  const textRef = useRef<HTMLDivElement>(null);

  const isHtml = isHtmlContent(task.task_content);
  const displayContent = task.task_content;

  return (
    <div
      className={styles.cardContainer}
      style={{
        backgroundColor: "var(--background-over-container)",
        borderRadius: "20px",
      }}
    >
      <div className={styles.checkboxContainer}>
        {task.completed !== null ? (
          <Checkbox
            status={task.completed}
            handleUpdateStatus={() => {}}
            ariaLabel="Checkbox preview"
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
            style={{ opacity: task.completed ? 0.3 : 1 }}
            dangerouslySetInnerHTML={{ __html: displayContent }}
          />
        ) : (
          <p
            ref={textRef as React.RefObject<HTMLParagraphElement>}
            className={styles.text}
            style={{ opacity: task.completed ? 0.3 : 1 }}
          >
            {linkifyWithIcon(displayContent)}
          </p>
        )}
        <WavyStrikethrough textRef={textRef as any} completed={task.completed} />
      </div>

      <div className={styles.editingButtons}>
        <TimeLimitBox
          target_date={task.target_date}
          idScrollArea="dummy-scroll-area"
          completed={task.completed}
        />
        <div className={styles.navigateBtn} style={{ cursor: "default" }}>
          <ArrowLeft
            style={{
              width: "14px",
              height: "14px",
              stroke: "var(--text)",
              strokeWidth: 2.5,
              transform: "rotate(180deg)",
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    </div>
  );
};
