"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { useAddTask } from "@/hooks/todo/tasks/useAddTask";
import { useAddTasks } from "@/hooks/todo/tasks/useAddTasks";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

import { ListsType } from "@/lib/schemas/database.types";

import { useTaskEditorSetup } from "./parts/useTaskEditorSetup";
import { useSmartDateManager } from "./parts/useSmartDateManager";
import { TaskEditor } from "./parts/TaskEditor";
import { PlaceholderText } from "./parts/PlaceholderText";
import { ActionBar } from "./parts/ActionBar";
import { ToolbarAnimated } from "./parts/ToolbarAnimated";
import { CharLimitIndicator } from "./parts/CharLimitIndicator";
import { SmartDateBubbleLayer } from "./parts/SmartDateBubbleLayer";
import { ItemTypeDropdown } from "./parts/ItemTypeDropdown";

import styles from "./task-input.module.css";

function combineDateAndTime(d?: Date, h?: string): string | null {
  if (!d) return null;
  const combined = new Date(d);
  const [hours, minutes] = (h ?? "23:59").split(":").map(Number);
  combined.setHours(hours, minutes, 0, 0);
  return combined.toISOString();
}

export default function TaskInput({ setList }: { setList?: ListsType }) {
  const { addTask } = useAddTask();
  const { addTasks } = useAddTasks();

  const [focus, setFocus] = useState(false);
  const [technicalFocus, setTechnicalFocus] = useState(false);
  const [selected, setSelected] = useState<Date | undefined>(undefined);
  const [hour, setHour] = useState<string | undefined>(undefined);
  const [isNote, setIsNote] = useState(false);
  const [editorText, setEditorText] = useState("");
  const [cursorPos, setCursorPos] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const formContainerRef = useRef<HTMLDivElement>(null);
  const handleAddRef = useRef<() => void>(() => {});

  const { editor, clearEditor, focusEditor, blurEditor } = useTaskEditorSetup({
    setFocus: setFocus,
    onSubmit: () => handleAddRef.current(),
    onEditorUpdate: (text, pos) => {
      setEditorText(text);
      setCursorPos(pos);
    },
    onFocus: () => {
      setFocus(true);
      setTechnicalFocus(true);
    },
    onBlur: () => {
      setTechnicalFocus(false);
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
    if (focus && editor) {
      const t = setTimeout(() => focusEditor(), 20);
      return () => clearTimeout(t);
    }
  }, [focus, editor, focusEditor]);

  const handleAdd = useCallback(() => {
    if (!editor || editor.isEmpty) {
      clearEditor();
      blurEditor();
      setSelected(undefined);
      setHour(undefined);
      setFocus(false);
      return;
    }
    const html = editor.getHTML();
    const combinedDate = combineDateAndTime(selected, hour);
    clearEditor();
    blurEditor();
    setSelected(undefined);
    setHour(undefined);
    setFocus(false);
    setEditorText("");
    setDismissedText(null);

    const listId = setList?.list_id;
    if (!listId) return;
    addTask(listId, html, combinedDate, isNote);
  }, [
    selected,
    hour,
    isNote,
    setList,
    addTask,
    editor,
    clearEditor,
    blurEditor,
    setDismissedText,
  ]);

  useEffect(() => {
    handleAddRef.current = handleAdd;
  }, [handleAdd]);

  useOnClickOutside(containerRef, (e: MouseEvent | TouchEvent) => {
    const target = e.target as Element | null;
    if (
      target?.closest(
        "#calendar-component, #dropdown-component, #ai-enhance-panel, .smart-date-bubble-container, [data-tippy-root], .tippy-box, [data-radix-popper-content-wrapper]",
      )
    )
      return;
    if (editor && !editor.isEmpty) return;
    setFocus(false);
    clearEditor();
    blurEditor();
    setHour(undefined);
    setSelected(undefined);
    setEditorText("");
    setDismissedText(null);
  });

  const charCount = editor?.storage?.characterCount?.characters?.() ?? 0;

  return (
    <section
      className={styles.container}
      ref={containerRef}
      onClick={() => setFocus(true)}
      style={{ cursor: "text" }}
    >
      <div
        className={styles.formContainer}
        style={{ position: "relative" }}
        ref={formContainerRef}
      >
        <SmartDateBubbleLayer
          activeDetected={activeDetected}
          showBubble={showBubble}
          focus={technicalFocus}
          bubbleCoords={bubbleCoords}
          setIsHoveringBubble={setIsHoveringBubble}
          onAssign={(d, h, txt) => {
            setSelected(d);
            if (h) setHour(h);
            focusEditor();
            setDismissedText(txt ?? null);
          }}
          onDismiss={() => {
            if (activeDetected) setDismissedText(activeDetected.text);
          }}
        />

        <div className={styles.form}>
          <div
            className={styles.inputManagerContainer}
            style={{ marginTop: "10px" }}
          >
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: focus ? 1 : 0, opacity: focus ? 1 : 0 }}
            >
              <ItemTypeDropdown
                isNote={isNote}
                setIsNote={setIsNote}
                inputRef={{ current: null } as any}
              />
            </motion.div>
          </div>

          <TaskEditor editor={editor} focus={focus} />

          <PlaceholderText focus={focus} />

          <ActionBar
            focus={focus}
            selected={selected}
            setSelected={setSelected}
            hour={hour}
            setHour={setHour}
            editor={editor}
            setList={setList}
            onAddTasks={addTasks}
            onSend={handleAdd}
          />
        </div>

        <ToolbarAnimated editor={editor} focus={focus} />

        <CharLimitIndicator charCount={charCount} />
      </div>
    </section>
  );
}
