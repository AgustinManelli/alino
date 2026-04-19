"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Editor, EditorContent } from "@tiptap/react";

import type { TaskType } from "@/lib/schemas/database.types";
import { useInlineEditor } from "./useInlineEditor";
import { InlineActionBar } from "./InlineActionBar";
import { InlineItemTypeDropdown } from "./InlineItemTypeDropdown";

import { SmartDateBubbleLayer } from "../../task-input/parts/SmartDateBubbleLayer";
import { useSmartDateManager } from "../../task-input/parts/useSmartDateManager";

import styles from "../TaskCard.module.css";

function extractDateAndHour(isoString: string | null) {
  if (!isoString) return { d: undefined, h: undefined };
  const date = new Date(isoString);
  const h = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  return { d: date, h };
}

function combineDateAndTime(d?: Date, h?: string): string | null {
  if (!d) return null;
  const combined = new Date(d);
  const [hours, minutes] = (h ?? "23:59").split(":").map(Number);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

interface InlineEditWrapperProps {
  task: TaskType;
  onSave: (
    html: string,
    completed: boolean | null,
    date: string | null,
  ) => void;
  onCancel: () => void;
  onEditorReady: (editor: Editor | null) => void;
  onFocusChange: (focused: boolean) => void;
}

export function InlineEditWrapper({
  task,
  onSave,
  onCancel,
  onEditorReady,
  onFocusChange,
}: InlineEditWrapperProps) {
  const { d: initialD, h: initialH } = extractDateAndHour(task.target_date);
  const [completed, setCompleted] = useState<boolean | null>(task.completed);
  const [selected, setSelected] = useState<Date | undefined>(initialD);
  const [hour, setHour] = useState<string | undefined>(initialH);
  const [editorText, setEditorText] = useState("");
  const [cursorPos, setCursorPos] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [technicalFocus, setTechnicalFocus] = useState(false);
  const formContainerRef = useRef<HTMLDivElement>(null);

  const handleSave = useCallback(() => {
    if (!editorRef.current) return;
    const html = editorRef.current.getHTML();
    const combinedDate = combineDateAndTime(selected, hour);
    onSave(html, completed, combinedDate);
  }, [completed, selected, hour, onSave]);

  const { editor, editorRef } = useInlineEditor({
    initialContent: task.task_content,
    onUpdate: (text, pos) => {
      setEditorText(text);
      setCursorPos(pos);
    },
    onSave: handleSave,
    onCancel,
    onFocusToggle: (val) => {
      setTechnicalFocus(val);
      if (val) setIsFocused(true);
    },
  });

  const {
    activeDetected,
    showBubble,
    bubbleCoords,
    setIsHoveringBubble,
    setDismissedText,
  } = useSmartDateManager({
    editorText,
    cursorPos,
    editor,
    focus: technicalFocus,
    formContainerRef,
  });

  useEffect(() => {
    if (editor) {
      setTimeout(() => editor.commands.focus("end"), 50);
    }
  }, [editor]);

  useEffect(() => {
    onEditorReady(editor);
    if (editor) onFocusChange(true);
    return () => {
      onEditorReady(null);
      onFocusChange(false);
    };
  }, [editor]);

  return (
    <>
      <div className={styles.cardContainer} ref={formContainerRef}>
        <SmartDateBubbleLayer
          activeDetected={activeDetected}
          showBubble={showBubble}
          focus={technicalFocus}
          bubbleCoords={bubbleCoords}
          setIsHoveringBubble={setIsHoveringBubble}
          onAssign={(d, h, txt) => {
            setSelected(d);
            if (h) setHour(h);
            editor?.commands.focus();
            setDismissedText(txt ?? null);
          }}
          onDismiss={() => {
            if (activeDetected) setDismissedText(activeDetected.text);
          }}
        />

        <div className={styles.checkboxContainer}>
          <InlineItemTypeDropdown
            completed={completed}
            setCompleted={setCompleted}
          />
        </div>

        <div className={styles.textContainer}>
          <div style={{ width: "100%", paddingRight: "5px" }}>
            <EditorContent
              editor={editor}
              className={styles.editorCardContent}
            />
          </div>
        </div>

        <InlineActionBar
          editor={editor}
          selected={selected}
          setSelected={setSelected}
          hour={hour}
          setHour={setHour}
          onSave={handleSave}
          onCancel={onCancel}
        />
      </div>
    </>
  );
}
