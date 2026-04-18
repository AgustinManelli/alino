"use client";
import { memo } from "react";
import { TASK_CHAR_LIMIT } from "@/config/app-config";
import styles from "../task-input.module.css";

function getCharColor(count: number): string {
  if (count > TASK_CHAR_LIMIT * 0.9) return "#fc0303";
  if (count > TASK_CHAR_LIMIT * 0.8) return "#fc8003";
  if (count > TASK_CHAR_LIMIT * 0.7) return "#ffb300";
  return "#8a8a8a";
}

interface CharLimitIndicatorProps {
  charCount: number;
}

export const CharLimitIndicator = memo(function CharLimitIndicator({
  charCount,
}: CharLimitIndicatorProps) {
  if (charCount === 0) return null;
  return (
    <p
      className={styles.limitIndicator}
      style={{ color: getCharColor(charCount) }}
    >
      {charCount}/{TASK_CHAR_LIMIT}
    </p>
  );
});
